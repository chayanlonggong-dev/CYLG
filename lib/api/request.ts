import { NextRequest } from "next/server";

export function getClientIp(
  request: NextRequest
) {
  const forwarded =
    request.headers.get(
      "x-forwarded-for"
    );

  if (forwarded) {
    return forwarded
      .split(",")[0]
      .trim();
  }

  return (
    request.headers.get(
      "x-real-ip"
    ) ?? "unknown"
  );
}

export function getUserAgent(
  request: NextRequest
) {
  return (
    request.headers.get(
      "user-agent"
    ) ?? "unknown"
  );
}

export function getBearerToken(
  request: NextRequest
) {
  const authorization =
    request.headers.get(
      "authorization"
    );

  if (!authorization) {
    return null;
  }

  if (
    !authorization.startsWith(
      "Bearer "
    )
  ) {
    return null;
  }

  return authorization.substring(7);
}

export async function parseJsonBody<T>(
  request: NextRequest
): Promise<T | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function getQueryParam(
  request: NextRequest,
  key: string
) {
  return (
    request.nextUrl.searchParams.get(
      key
    ) ?? null
  );
}

export function getPagination(
  request: NextRequest
) {
  const page =
    Number(
      getQueryParam(
        request,
        "page"
      )
    ) || 1;

  const limit =
    Number(
      getQueryParam(
        request,
        "limit"
      )
    ) || 20;

  return {
    page: Math.max(page, 1),
    limit: Math.min(
      Math.max(limit, 1),
      100
    ),
  };
}