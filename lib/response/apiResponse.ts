import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
}

export function success<T>(
  data?: T,
  message = "Success",
  status = 200
) {
  const body: ApiResponse<T> = {
    success: true,
    message,
    data,
  };

  return NextResponse.json(body, {
    status,
  });
}

export function failure(
  message = "Request failed",
  status = 400,
  errors?: unknown
) {
  const body: ApiResponse = {
    success: false,
    message,
    errors,
  };

  return NextResponse.json(body, {
    status,
  });
}

export function created<T>(
  data?: T,
  message = "Created"
) {
  return success(data, message, 201);
}

export function noContent() {
  return new NextResponse(null, {
    status: 204,
  });
}

export function unauthorized(
  message = "Unauthorized"
) {
  return failure(message, 401);
}

export function forbidden(
  message = "Forbidden"
) {
  return failure(message, 403);
}

export function notFound(
  message = "Not Found"
) {
  return failure(message, 404);
}

export function serverError(
  message = "Internal Server Error"
) {
  return failure(message, 500);
}