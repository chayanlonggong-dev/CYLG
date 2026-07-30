import { NextResponse } from "next/server";

export function apiSuccess<T>(
  data: T | null = null,
  message = "Success",
  status = 200
) {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
        ...(data as Record<string, unknown>),
      },
      { status }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function apiError(
  message = "Request failed",
  status = 400,
  errorCode = "REQUEST_FAILED",
  details?: unknown
) {
  const payload: Record<string, unknown> = {
    success: false,
    message,
    errorCode,
  };

  if (details !== undefined) {
    payload.details = details;
  }

  return NextResponse.json(payload, { status });
}

export function apiBadRequest(
  message = "Bad request",
  errorCode = "BAD_REQUEST",
  details?: unknown
) {
  return apiError(message, 400, errorCode, details);
}

export function apiConflict(
  message = "Conflict",
  errorCode = "CONFLICT",
  details?: unknown
) {
  return apiError(message, 409, errorCode, details);
}

export function apiUnauthorized(
  message = "Unauthorized",
  errorCode = "UNAUTHORIZED"
) {
  return apiError(message, 401, errorCode);
}

export function apiForbidden(
  message = "Forbidden",
  errorCode = "FORBIDDEN"
) {
  return apiError(message, 403, errorCode);
}

export function apiNotFound(
  message = "Not found",
  errorCode = "NOT_FOUND"
) {
  return apiError(message, 404, errorCode);
}

export function apiMethodNotAllowed(
  message = "Method not allowed",
  errorCode = "METHOD_NOT_ALLOWED"
) {
  return apiError(message, 405, errorCode);
}

export function apiServerError(
  message = "Internal server error",
  errorCode = "INTERNAL_SERVER_ERROR"
) {
  return apiError(message, 500, errorCode);
}