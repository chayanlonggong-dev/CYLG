import { randomBytes, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const CSRF_COOKIE_NAME = "cylg_csrf";
export const CSRF_HEADER_NAME = "x-csrf-token";

const CSRF_TOKEN_BYTES = 32;

export function generateCsrfToken(): string {
  return randomBytes(CSRF_TOKEN_BYTES).toString("hex");
}

export function setCsrfCookie(
  response: NextResponse,
  token?: string
): string {
  const value = token ?? generateCsrfToken();

  response.cookies.set(CSRF_COOKIE_NAME, value, {
    httpOnly: false, // 前端需讀取後放進 header
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return value;
}

export function clearCsrfCookie(response: NextResponse) {
  response.cookies.set(CSRF_COOKIE_NAME, "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

function safeEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");

    if (bufA.length !== bufB.length) {
      return false;
    }

    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Double-Submit CSRF:
 * Cookie 與 Header 必須同時存在且 constant-time 相等。
 * 僅應對會改狀態的方法驗證（POST/PUT/PATCH/DELETE）。
 */
export function verifyCsrf(request: NextRequest): boolean {
  const method = request.method.toUpperCase();

  if (
    method === "GET" ||
    method === "HEAD" ||
    method === "OPTIONS"
  ) {
    return true;
  }

  const cookieToken =
    request.cookies.get(CSRF_COOKIE_NAME)?.value ?? "";
  const headerToken =
    request.headers.get(CSRF_HEADER_NAME)?.trim() ?? "";

  if (!cookieToken || !headerToken) {
    return false;
  }

  return safeEqual(cookieToken, headerToken);
}