import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "@/lib/security/csrf";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(
    new RegExp(
      "(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)"
    )
  );

  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Admin 專用 fetch：自動帶 credentials + CSRF header。
 * 所有會改狀態的 Admin API 請求都應改用此函式。
 */
export async function adminFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers || {});

  const method = (init.method || "GET").toUpperCase();

  if (
    method !== "GET" &&
    method !== "HEAD" &&
    method !== "OPTIONS"
  ) {
    const csrf = getCookie(CSRF_COOKIE_NAME);

    if (csrf) {
      headers.set(CSRF_HEADER_NAME, csrf);
    }
  }

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });
}