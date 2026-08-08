import {
  NextRequest,
} from "next/server";

import {
  prisma,
} from "@/lib/prisma";

import {
  verifySync,
} from "otplib";

import {
  getAdminSession,
} from "@/lib/auth/session";

import {
  rateLimit,
} from "@/lib/rateLimit";

import {
  createAuditLog,
} from "@/lib/audit/audit";

import {
  apiBadRequest,
  apiMethodNotAllowed,
  apiServerError,
  apiUnauthorized,
  apiError,
  apiNotFound,
  apiSuccess,
} from "@/lib/api/response";

import {
  isEmptyJsonBody,
  parseRequestJson,
} from "@/lib/api/request";


export async function POST(
  request: NextRequest
) {
  try {
    const session =
      await getAdminSession();

    if (!session) {
      return apiUnauthorized(
        "Unauthorized.",
        "UNAUTHORIZED"
      );
    }


    const limit =
      rateLimit(
        `2fa-setup-verify:${session.adminUserId}`,
        {
          limit: 10,
          windowMs:
            60 * 60 * 1000,
        }
      );

    if (!limit.success) {
      return apiError(
        "Too many requests.",
        429,
        "RATE_LIMITED"
      );
    }


    const {
      body,
      error,
    } =
      await parseRequestJson<
        Record<string, unknown>
      >(request);

    if (error === "INVALID_JSON") {
      return apiBadRequest(
        "Invalid JSON body.",
        "INVALID_JSON"
      );
    }

    if (
      !body ||
      isEmptyJsonBody(body)
    ) {
      return apiBadRequest(
        "Request body is required.",
        "EMPTY_BODY"
      );
    }


    const token =
      typeof body.token === "string"
        ? body.token.trim()
        : "";

    if (!token) {
      return apiBadRequest(
        "Token is required.",
        "MISSING_TOKEN"
      );
    }


    const adminUser =
      await prisma.adminUser.findUnique({
        where: {
          id:
            session.adminUserId,
        },
      });


    if (!adminUser) {
      return apiNotFound(
        "Admin user not found.",
        "ADMIN_USER_NOT_FOUND"
      );
    }


    if (
      adminUser.twoFactorEnabled
    ) {
      return apiError(
        "Two-factor authentication is already enabled.",
        400,
        "TWO_FACTOR_ALREADY_ENABLED"
      );
    }


    if (
      !adminUser.twoFactorSecret
    ) {
      return apiBadRequest(
        "2FA setup has not started.",
        "TWO_FACTOR_NOT_STARTED"
      );
    }


    /*
     * Verify the authenticator code.
     *
     * otplib v13 returns a verification
     * result object, not a boolean.
     */
    const verified =
      verifySync({
        token,
        secret:
          adminUser.twoFactorSecret,
      });


    if (!verified.valid) {
      return apiUnauthorized(
        "Invalid 2FA code.",
        "INVALID_2FA_CODE"
      );
    }


    await prisma.adminUser.update({
      where: {
        id:
          adminUser.id,
      },

      data: {
        twoFactorEnabled:
          true,
      },
    });


    await createAuditLog({
      action:
        "UPDATE",

      entity:
        "AdminUser",

      entityId:
        adminUser.id,

      userId:
        String(
          adminUser.id
        ),

      description:
        "Admin enabled two-factor authentication.",

      metadata: {
        result:
          "Success",

        actionLabel:
          "ENABLE_2FA",
      },
    });


    return apiSuccess(
      null,
      "2FA enabled successfully.",
      200
    );

  } catch (error) {
    console.error(
      "2FA VERIFY ERROR:",
      error
    );

    return apiServerError(
      "2FA verification failed.",
      "2FA_VERIFY_FAILED"
    );
  }
}


export async function OPTIONS() {
  return apiMethodNotAllowed(
    "Method not allowed for this route.",
    "METHOD_NOT_ALLOWED"
  );
}