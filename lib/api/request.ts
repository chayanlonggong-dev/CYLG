import { NextRequest } from "next/server";

import { LEVELS } from "@/app/data/options";

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

export async function parseRequestJson<T>(
  request: NextRequest | Request
): Promise<{ body: T | null; error: "INVALID_JSON" | null }> {
  try {
    return {
      body: await request.json(),
      error: null,
    };
  } catch {
    return {
      body: null,
      error: "INVALID_JSON",
    };
  }
}

export function isEmptyJsonBody(body: unknown) {
  return (
    body === undefined ||
    body === null ||
    (typeof body === "object" && !Array.isArray(body) && Object.keys(body).length === 0)
  );
}

export function isValidModelId(value: string | number) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric > 0;
}

export function isValidModelLevel(level: string) {
  return LEVELS.includes(level as (typeof LEVELS)[number]);
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