import { NextRequest } from "next/server";

import {
  repairAllIntegrityIssues,
} from "@/lib/security/repair";

import {
  getAdminSession,
} from "@/lib/auth/session";

import {
  createAuditLog,
} from "@/lib/audit/audit";

import {
  rateLimit,
} from "@/lib/rateLimit";

import {
  apiBadRequest,
  apiError,
  apiMethodNotAllowed,
  apiServerError,
  apiUnauthorized,
  apiSuccess,
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
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// =====================================================
// POST
// Security Integrity Repair
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
    // Rate limit
    // =================================================

    const limit = rateLimit(
      `security-integrity-repair:${ip}`,
      {
        limit: 3,
        windowMs:
          60 * 60 * 1000,
      }
    );

    if (!limit.success) {
      return apiError(
        "Too many repair attempts.",
        429,
        "REPAIR_RATE_LIMITED"
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
        "Repair confirmation is required.",
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

    if (
      body.confirm !== true
    ) {
      return apiBadRequest(
        "Security integrity repair requires explicit confirmation.",
        "REPAIR_CONFIRMATION_REQUIRED"
      );
    }

    // =================================================
    // Execute repair
    // =================================================

    const result =
      repairAllIntegrityIssues();

    // =================================================
    // Audit Log
    // =================================================

    await createAuditLog({
      action: "UPDATE",

      entity:
        "SecurityIntegrity",

      entityId:
        "REPAIR",

      userId:
        String(
          session.adminUserId
        ),

      description:
        "Security integrity repair executed.",

      metadata: {
        ip,

        operator:
          session.username,

        result:
          result.failed === 0
            ? "Success"
            : "Partial",

        actionLabel:
          "SECURITY_INTEGRITY_REPAIR",

        requested:
          result.requested,

        repaired:
          result.repaired,

        skipped:
          result.skipped,

        failed:
          result.failed,

        repairResults:
          result.results,
      },
    });

    // =================================================
    // Return result
    // =================================================

    return apiSuccess(
      {
        repaired:
          result.repaired > 0,

        requested:
          result.requested,

        repairedCount:
          result.repaired,

        skipped:
          result.skipped,

        failed:
          result.failed,

        results:
          result.results,
      },

      result.failed === 0
        ? "Security integrity repair completed."
        : "Security integrity repair completed with failures.",

      result.failed === 0
        ? 200
        : 207
    );
  } catch (error) {
    console.error(
      "SECURITY INTEGRITY REPAIR ERROR:",
      error
    );

    return apiServerError(
      "Security integrity repair failed.",
      "INTEGRITY_REPAIR_FAILED"
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
