import { NextRequest } from "next/server";

function getAllowedOrigins(): Set<string> {
  const allowed = new Set<string>();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (siteUrl) {
    try {
      allowed.add(new URL(siteUrl).origin.toLowerCase());
    } catch {
      // Ignore invalid configuration.
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
  const allowedOrigins = getAllowedOrigins();

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

  return false;
}
