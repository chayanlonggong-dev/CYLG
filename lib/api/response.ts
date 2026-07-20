import { NextResponse } from "next/server";

export function apiSuccess<T>(
  data?: T,
  message = "Success",
  status = 200
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    {
      status,
    }
  );
}

export function apiError(
  message = "Request failed",
  status = 400,
  details?: unknown
) {
  return NextResponse.json(
    {
      success: false,
      message,
      details,
    },
    {
      status,
    }
  );
}

export function apiUnauthorized(
  message = "Unauthorized"
) {
  return apiError(
    message,
    401
  );
}

export function apiForbidden(
  message = "Forbidden"
) {
  return apiError(
    message,
    403
  );
}

export function apiNotFound(
  message = "Not found"
) {
  return apiError(
    message,
    404
  );
}

export function apiServerError(
  message = "Internal server error"
) {
  return apiError(
    message,
    500
  );
}