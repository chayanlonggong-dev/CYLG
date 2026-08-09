import { NextRequest } from "next/server";

import { getAdminSession } from "@/lib/auth/session";

import { prisma } from "@/lib/prisma";

import { rateLimit } from "@/lib/rateLimit";

import { createAuditLog } from "@/lib/audit/audit";

import {
  executeSecurityRecovery,
} from "@/lib/security/recovery";

import {
  apiBadRequest,
  apiError,
  apiMethodNotAllowed,
  apiServerError,
  apiSuccess,
  apiUnauthorized,
} from "@/lib/api/response";

import {
  isEmptyJsonBody,
  parseRequestJson,
} from "@/lib/api/request";

// =====================================================
// Get Client IP
// =====================================================

function getClientIp(
  request: NextRequest
): string {
  return (
    request.headers
      .get("x-forwarded-for")
      ?.split(",")[0]
      ?.trim() ||
    request.headers.get(
      "x-real-ip"
    ) ||
    "unknown"
  );
}

// =====================================================
// POST
// Emergency Security Recovery
// =====================================================

export async function POST(
  request: NextRequest
) {
  try {
    // =================================================
    // Authenticate administrator
    // =================================================

    const session =
      await getAdminSession();

    if (!session) {
      return apiUnauthorized(
        "Unauthorized.",
        "UNAUTHORIZED"
      );
    }

    // =================================================
    // Client IP
    // =================================================

    const ip =
      getClientIp(request);

    // =================================================
    // Strong rate limit
    //
    // Emergency recovery should never be
    // repeatedly executable.
    // =================================================

    const limit = rateLimit(
      `security-recovery:${ip}`,
      {
        limit: 3,
        windowMs:
          60 * 60 * 1000,
      }
    );

    if (!limit.success) {
      return apiError(
        "Too many recovery attempts.",
        429,
        "RECOVERY_RATE_LIMITED"
      );
    }

    // =================================================
    // Parse request
    // =================================================

    const parsedBody =
      await parseRequestJson<
        Record<string, unknown>
      >(request);

    if (
      parsedBody.error ===
      "INVALID_JSON"
    ) {
      return apiBadRequest(
        "Invalid JSON body.",
        "INVALID_JSON"
      );
    }

    if (
      !parsedBody.body ||
      isEmptyJsonBody(
        parsedBody.body
      )
    ) {
      return apiBadRequest(
        "Recovery confirmation is required.",
        "EMPTY_BODY"
      );
    }

    const body =
      parsedBody.body as Record<
        string,
        unknown
      >;

    // =================================================
    // Explicit confirmation
    // =================================================

    if (body.confirm !== true) {
      return apiBadRequest(
        "Security recovery requires explicit confirmation.",
        "RECOVERY_CONFIRMATION_REQUIRED"
      );
    }

    // =================================================
    // Execute recovery
    //
    // IMPORTANT:
    // Pass the current SESSION ID so the recovery
    // process can preserve the session that is
    // executing this operation.
    // =================================================

    const result =
      await executeSecurityRecovery(
        session.adminUserId,
        session.sessionId,
        ip
      );

    // =================================================
    // Record CRITICAL security event
    // =================================================

    const securityEvent =
      await prisma.securityEvent.create({
        data: {
          type:
            "SENSITIVE_ACTION",

          severity:
            "CRITICAL",

          status:
            "OPEN",

          ip:
            ip === "unknown"
              ? null
              : ip,

          country: null,

          userAgent:
            request.headers.get(
              "user-agent"
            ),

          adminUserId:
            session.adminUserId,

          description:
            "Emergency security recovery executed by administrator.",

          metadata:
            JSON.stringify({
              action:
                "EMERGENCY_SECURITY_RECOVERY",

              threatWindowMs:
                5 * 60 * 1000,

              threatCount:
                result.threatCount,

              blockedIps:
                result.blockedIps,

              blockedIpCount:
                result.blockedIps.length,

              revokedSessions:
                result.revokedSessions,

              skippedCurrentIp:
                result.skippedCurrentIp,

              currentSessionId:
                session.sessionId,

              operator:
                session.username,

              result:
                "Success",

              actionLabel:
                "EMERGENCY_SECURITY_RECOVERY",
            }),
        },
      });

    // =================================================
    // Audit Log
    // =================================================

    await createAuditLog({
      action: "UPDATE",

      entity:
        "SecurityRecovery",

      entityId:
        securityEvent.id,

      userId:
        String(
          session.adminUserId
        ),

      description:
        "Emergency security recovery executed.",

      metadata: {
        ip,

        operator:
          session.username,

        result:
          "Success",

        actionLabel:
          "EMERGENCY_SECURITY_RECOVERY",

        threatCount:
          result.threatCount,

        blockedIps:
          result.blockedIps,

        blockedIpCount:
          result.blockedIps.length,

        revokedSessions:
          result.revokedSessions,

        skippedCurrentIp:
          result.skippedCurrentIp,

        currentSessionId:
          session.sessionId,
      },
    });

    // =================================================
    // Return result
    // =================================================

    return apiSuccess(
      {
        recovered: true,

        blockedIps:
          result.blockedIps,

        blockedIpCount:
          result.blockedIps.length,

        revokedSessions:
          result.revokedSessions,

        threatCount:
          result.threatCount,

        skippedCurrentIp:
          result.skippedCurrentIp,
      },

      "Emergency security recovery completed.",

      200
    );
  } catch (error) {
    console.error(
      "SECURITY RECOVERY ERROR:",
      error
    );

    return apiServerError(
      "Emergency security recovery failed.",
      "SECURITY_RECOVERY_FAILED"
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