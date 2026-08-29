import { setCsrfCookie } from "@/lib/security/csrf";
import {
  NextRequest,
} from "next/server";

import {
  prisma,
} from "@/lib/prisma";

import {
  verifyPassword,
} from "@/lib/auth/password";

import {
  randomBytes,
} from "crypto";

import {
  verifySync,
} from "otplib";

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
  apiSuccess,
} from "@/lib/api/response";

import {
  isEmptyJsonBody,
  parseRequestJson,
} from "@/lib/api/request";

const MAX_LOGIN_ATTEMPTS = 5;

const LOCK_TIME =
  15 * 60 * 1000;

const TWO_FACTOR_MAX_ATTEMPTS = 10;

const TWO_FACTOR_RATE_WINDOW =
  60 * 60 * 1000;

// =====================================================
// SECURITY EVENT HELPER
// =====================================================

async function createSecurityEvent(data: {
  type:
    | "LOGIN_FAILED"
    | "ACCOUNT_LOCKED"
    | "INVALID_2FA"
    | "TWO_FACTOR_RATE_LIMITED"
    | "FIREWALL_BLOCKED"
    | "RATE_LIMIT_EXCEEDED"
    | "SUSPICIOUS_SESSION"
    | "UNAUTHORIZED_ACCESS"
    | "SENSITIVE_ACTION";

  severity:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL";

  ip?: string | null;
  country?: string | null;
  userAgent?: string | null;
  adminUserId?: number | null;
  description: string;
  metadata?: Record<
    string,
    unknown
  >;
}) {
  try {
    await prisma.securityEvent.create({
      data: {
        type: data.type,
        severity: data.severity,
        status: "OPEN",

        ip:
          data.ip ?? null,

        country:
          data.country ?? null,

        userAgent:
          data.userAgent ?? null,

        adminUserId:
          data.adminUserId ?? null,

        description:
          data.description,

        metadata:
          data.metadata
            ? JSON.stringify(
                data.metadata
              )
            : null,
      },
    });
  } catch (error) {
    /*
     * Security event logging must never
     * break the authentication flow.
     */
    console.error(
      "SECURITY EVENT CREATE ERROR:",
      error
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const ip =
      request.headers
        .get("x-forwarded-for")
        ?.split(",")[0]
        ?.trim() ||
      request.headers.get(
        "x-real-ip"
      ) ||
      "unknown";

    const userAgent =
      request.headers.get(
        "user-agent"
      ) ||
      "unknown";

    const country =
      request.headers
        .get(
          "x-vercel-ip-country"
        )
        ?.toUpperCase() ||
      null;

    // =====================================================
    // LOGIN RATE LIMIT
    // =====================================================

    const limit = rateLimit(
      `admin-login:${ip}`,
      {
        limit: 5,
        windowMs: 60 * 1000,
      }
    );

    if (!limit.success) {
      await createSecurityEvent({
        type:
          "RATE_LIMIT_EXCEEDED",

        severity:
          "HIGH",

        ip,

        country,

        userAgent,

        description:
          "Admin login rate limit exceeded.",

        metadata: {
          operator:
            "Unknown",

          result:
            "Blocked",

          actionLabel:
            "ADMIN_LOGIN_RATE_LIMITED",
        },
      });

      return apiError(
        "Too many login attempts. Please try again later.",
        429,
        "RATE_LIMITED"
      );
    }

    // =====================================================
    // PARSE REQUEST
    // =====================================================

    const {
      body,
      error,
    } =
      await parseRequestJson<
        Record<string, unknown>
      >(request);

    if (
      error ===
      "INVALID_JSON"
    ) {
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

    const username =
      typeof body.username ===
      "string"
        ? body.username.trim()
        : "";

    const password =
      typeof body.password ===
      "string"
        ? body.password
        : "";

    const twoFactorToken =
      typeof body.twoFactorToken ===
      "string"
        ? body.twoFactorToken.trim()
        : "";

    if (
      !username ||
      !password
    ) {
      return apiBadRequest(
        "Username and password are required.",
        "MISSING_CREDENTIALS"
      );
    }

    // =====================================================
    // FIND ADMIN USER
    // =====================================================

    const adminUser =
      await prisma.adminUser.findUnique({
        where: {
          username,
        },
      });

    if (!adminUser) {
      await createSecurityEvent({
        type:
          "LOGIN_FAILED",

        severity:
          "MEDIUM",

        ip,

        country,

        userAgent,

        description:
          "Admin login failed because the username does not exist.",

        metadata: {
          username,
          result:
            "Failed",

          actionLabel:
            "LOGIN_UNKNOWN_USER",
        },
      });

      await createAuditLog({
        action:
          "LOGIN",

        entity:
          "AdminUser",

        entityId:
          "UNKNOWN",

        description:
          "Admin login failed because the username does not exist.",

        metadata: {
          ip,

          operator:
            username,

          result:
            "Failed",

          actionLabel:
            "LOGIN_UNKNOWN_USER",
        },
      });

      return apiUnauthorized(
        "Invalid username or password.",
        "INVALID_CREDENTIALS"
      );
    }

    // =====================================================
    // ACCOUNT LOCK CHECK
    // =====================================================

    if (
      adminUser.lockedUntil &&
      adminUser.lockedUntil >
        new Date()
    ) {
      await createSecurityEvent({
        type:
          "ACCOUNT_LOCKED",

        severity:
          "HIGH",

        ip,

        country,

        userAgent,

        adminUserId:
          adminUser.id,

        description:
          "Login attempt against a temporarily locked administrator account.",

        metadata: {
          username:
            adminUser.username,

          result:
            "Blocked",

          actionLabel:
            "ACCOUNT_LOCKED_ACCESS_ATTEMPT",

          lockedUntil:
            adminUser.lockedUntil.toISOString(),
        },
      });

      return apiError(
        "Account temporarily locked. Try again later.",
        423,
        "ACCOUNT_LOCKED"
      );
    }

    // =====================================================
    // PASSWORD VERIFICATION
    // =====================================================

    const valid =
      verifyPassword(
        password,
        adminUser.password
      );

    if (!valid) {
      const attempts =
        adminUser.failedLoginAttempts +
        1;

      const shouldLock =
        attempts >=
        MAX_LOGIN_ATTEMPTS;

      const lockedUntil =
        shouldLock
          ? new Date(
              Date.now() +
                LOCK_TIME
            )
          : null;

      await prisma.adminUser.update({
        where: {
          id:
            adminUser.id,
        },

        data: {
          failedLoginAttempts:
            shouldLock
              ? 0
              : attempts,

          lockedUntil,
        },
      });

      await createAuditLog({
        action:
          "LOGIN",

        entity:
          "AdminUser",

        entityId:
          adminUser.id,

        userId:
          String(
            adminUser.id
          ),

        description:
          shouldLock
            ? "Admin login failed and account was temporarily locked."
            : "Admin login failed.",

        metadata: {
          ip,

          operator:
            adminUser.username,

          result:
            "Failed",

          actionLabel:
            shouldLock
              ? "ACCOUNT_LOCKED"
              : "LOGIN_FAILED",

          failedAttempts:
            attempts,
        },
      });

      if (shouldLock) {
        await createSecurityEvent({
          type:
            "ACCOUNT_LOCKED",

          severity:
            "HIGH",

          ip,

          country,

          userAgent,

          adminUserId:
            adminUser.id,

          description:
            "Administrator account was temporarily locked after repeated failed login attempts.",

          metadata: {
            username:
              adminUser.username,

            failedAttempts:
              attempts,

            lockDurationMinutes:
              15,

            result:
              "Blocked",

            actionLabel:
              "ACCOUNT_LOCKED",
          },
        });

        return apiError(
          "Too many failed login attempts. Account temporarily locked.",
          423,
          "ACCOUNT_LOCKED"
        );
      }

      await createSecurityEvent({
        type:
          "LOGIN_FAILED",

        severity:
          "MEDIUM",

        ip,

        country,

        userAgent,

        adminUserId:
          adminUser.id,

        description:
          "Administrator login failed because the password was invalid.",

        metadata: {
          username:
            adminUser.username,

          failedAttempts:
            attempts,

          remainingAttempts:
            Math.max(
              MAX_LOGIN_ATTEMPTS -
                attempts,
              0
            ),

          result:
            "Failed",

          actionLabel:
            "LOGIN_FAILED",
        },
      });

      return apiUnauthorized(
        "Invalid username or password.",
        "INVALID_CREDENTIALS"
      );
    }

    // =====================================================
    // TWO-FACTOR AUTHENTICATION
    // =====================================================

    if (
      adminUser.twoFactorEnabled
    ) {
      // ---------------------------------------------------
      // Separate 2FA rate limit
      // ---------------------------------------------------

      const twoFactorLimit =
        rateLimit(
          `admin-login-2fa:${adminUser.id}`,
          {
            limit:
              TWO_FACTOR_MAX_ATTEMPTS,

            windowMs:
              TWO_FACTOR_RATE_WINDOW,
          }
        );

      if (
        !twoFactorLimit.success
      ) {
        await createAuditLog({
          action:
            "LOGIN",

          entity:
            "AdminUser",

          entityId:
            adminUser.id,

          userId:
            String(
              adminUser.id
            ),

          description:
            "Admin 2FA verification rate limit exceeded.",

          metadata: {
            ip,

            operator:
              adminUser.username,

            result:
              "Warning",

            actionLabel:
              "2FA_RATE_LIMITED",
          },
        });

        await createSecurityEvent({
          type:
            "TWO_FACTOR_RATE_LIMITED",

          severity:
            "HIGH",

          ip,

          country,

          userAgent,

          adminUserId:
            adminUser.id,

          description:
            "Administrator two-factor authentication rate limit was exceeded.",

          metadata: {
            username:
              adminUser.username,

            result:
              "Blocked",

            actionLabel:
              "2FA_RATE_LIMITED",
          },
        });

        return apiError(
          "Too many two-factor authentication attempts. Please try again later.",
          429,
          "TWO_FACTOR_RATE_LIMITED"
        );
      }

      // ---------------------------------------------------
      // Require 2FA token
      // ---------------------------------------------------

      if (
        !twoFactorToken
      ) {
        return apiSuccess(
          {
            requireTwoFactor:
              true,
          },
          "Two factor authentication required.",
          200
        );
      }

      // ---------------------------------------------------
      // Verify 2FA configuration
      // ---------------------------------------------------

      if (
        !adminUser.twoFactorSecret
      ) {
        await createAuditLog({
          action:
            "LOGIN",

          entity:
            "AdminUser",

          entityId:
            adminUser.id,

          userId:
            String(
              adminUser.id
            ),

          description:
            "Admin login failed because 2FA configuration is invalid.",

          metadata: {
            ip,

            operator:
              adminUser.username,

            result:
              "Failed",

            actionLabel:
              "INVALID_2FA_CONFIGURATION",
          },
        });

        await createSecurityEvent({
          type:
            "SENSITIVE_ACTION",

          severity:
            "CRITICAL",

          ip,

          country,

          userAgent,

          adminUserId:
            adminUser.id,

          description:
            "Administrator login encountered an invalid two-factor authentication configuration.",

          metadata: {
            username:
              adminUser.username,

            result:
              "Failed",

            actionLabel:
              "INVALID_2FA_CONFIGURATION",
          },
        });

        return apiServerError(
          "2FA configuration error.",
          "INVALID_2FA_CONFIGURATION"
        );
      }

      // ---------------------------------------------------
      // Verify TOTP
      // ---------------------------------------------------

      const verified =
        verifySync({
          token:
            twoFactorToken,

          secret:
            adminUser.twoFactorSecret,
        });

      if (
        !verified.valid
      ) {
        await createAuditLog({
          action:
            "LOGIN",

          entity:
            "AdminUser",

          entityId:
            adminUser.id,

          userId:
            String(
              adminUser.id
            ),

          description:
            "Admin login failed because the 2FA code was invalid.",

          metadata: {
            ip,

            operator:
              adminUser.username,

            result:
              "Failed",

            actionLabel:
              "INVALID_2FA_CODE",
          },
        });

        await createSecurityEvent({
          type:
            "INVALID_2FA",

          severity:
            "HIGH",

          ip,

          country,

          userAgent,

          adminUserId:
            adminUser.id,

          description:
            "Administrator login failed because the submitted two-factor authentication code was invalid.",

          metadata: {
            username:
              adminUser.username,

            result:
              "Failed",

            actionLabel:
              "INVALID_2FA_CODE",
          },
        });

        return apiUnauthorized(
          "Invalid 2FA code.",
          "INVALID_2FA_CODE"
        );
      }
    }

    // =====================================================
    // LOGIN FULLY VERIFIED
    // =====================================================
    // Failed login state is cleared ONLY after:
    //
    // Password is correct
    // AND
    // 2FA is correct when enabled
    //
    // This prevents a correct password + failed 2FA
    // from resetting the security state.
    // =====================================================

    if (
      adminUser.failedLoginAttempts >
        0 ||
      adminUser.lockedUntil
    ) {
      await prisma.adminUser.update({
        where: {
          id:
            adminUser.id,
        },

        data: {
          failedLoginAttempts:
            0,

          lockedUntil:
            null,
        },
      });
    }

    // =====================================================
    // CREATE SESSION
    // =====================================================

    const token =
      randomBytes(32)
        .toString("hex");

    const expiresAt =
      new Date(
        Date.now() +
          1000 *
            60 *
            60 *
            24 *
            7
      );

    const session =
      await prisma.session.create({
        data: {
          token,

          adminUserId:
            adminUser.id,

          expiresAt,

          lastActivityAt:
            new Date(),

          ip,

          userAgent,
        },
      });

    if (!session) {
      return apiServerError(
        "Failed to create session.",
        "SESSION_CREATE_FAILED"
      );
    }

    // =====================================================
    // AUDIT LOG
    // =====================================================

    await createAuditLog({
      action:
        "LOGIN",

      entity:
        "AdminUser",

      entityId:
        adminUser.id,

      userId:
        String(
          adminUser.id
        ),

      description:
        adminUser.twoFactorEnabled
          ? "Admin login successful with two-factor authentication."
          : "Admin login successful.",

      metadata: {
        ip,

        operator:
          adminUser.username,

        result:
          "Success",

        actionLabel:
          adminUser.twoFactorEnabled
            ? "LOGIN_2FA_SUCCESS"
            : "LOGIN_SUCCESS",

        browser:
          userAgent,
      },
    });

    // =====================================================
    // RESPONSE + SECURE SESSION COOKIE
    // =====================================================

    const response =
      apiSuccess(
        null,
        "Login successful.",
        200
      );

        response.cookies.set(
      "cylg_admin_session",
      token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      }
    );

    setCsrfCookie(response);

    return response;
  } catch (error) {
    console.error(
      "Admin login error:",
      error
    );

    return apiServerError(
      "Internal server error.",
      "ADMIN_LOGIN_FAILED"
    );
  }
}

// =====================================================
// OPTIONS
// =====================================================

export async function OPTIONS() {
  return apiMethodNotAllowed(
    "Method not allowed for this route.",
    "METHOD_NOT_ALLOWED"
  );
}
