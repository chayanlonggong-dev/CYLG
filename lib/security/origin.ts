import { NextRequest } from "next/server";

/**
 * Build the set of allowed Admin API origins.
 * Always includes www / non-www variants of NEXT_PUBLIC_SITE_URL
 * and the host currently serving this request (true same-origin).
 */
function getAllowedOrigins(request?: NextRequest): Set<string> {
  const allowed = new Set<string>();

  const addOrigin = (value: string | null | undefined) => {
    if (!value) return;
    try {
      const origin = new URL(value).origin.toLowerCase();
      allowed.add(origin);

      const url = new URL(origin);
      const host = url.hostname;

      // Accept both apex and www for the configured site host.
      if (host.startsWith("www.")) {
        const apex = new URL(url.toString());
        apex.hostname = host.slice(4);
        allowed.add(apex.origin.toLowerCase());
      } else if (host.includes(".")) {
        const withWww = new URL(url.toString());
        withWww.hostname = `www.${host}`;
        allowed.add(withWww.origin.toLowerCase());
      }
    } catch {
      // Ignore invalid values.
    }
  };

  addOrigin(process.env.NEXT_PUBLIC_SITE_URL);

  // The host that is actually handling this request must always be allowed
  // for same-origin Admin UI → Admin API calls (desktop + mobile).
  if (request) {
    try {
      addOrigin(request.nextUrl.origin);
    } catch {
      // Ignore.
    }
  }

  if (process.env.NODE_ENV !== "production") {
    allowed.add("http://localhost:3000");
    allowed.add("http://127.0.0.1:3000");
  }

  return allowed;
}

export function verifyAdminOrigin(
  request: NextRequest
): boolean {
  const allowedOrigins = getAllowedOrigins(request);

  const origin = request.headers.get("origin");

  if (origin) {
    try {
      return allowedOrigins.has(
        new URL(origin).origin.toLowerCase()
      );
    } catch {
      return false;
    }
  }

  const referer = request.headers.get("referer");

  if (referer) {
    try {
      return allowedOrigins.has(
        new URL(referer).origin.toLowerCase()
      );
    } catch {
      return false;
    }
  }

  // No Origin and no Referer:
  // Same-origin GETs from some mobile privacy modes can omit both.
  // Only allow when the request carries the admin session cookie
  // (still blocked for pure anonymous cross-site tooling without cookies).
  const hasSession = Boolean(
    request.cookies.get("cylg_admin_session")?.value
  );

  if (hasSession) {
    return true;
  }

  return false;
}