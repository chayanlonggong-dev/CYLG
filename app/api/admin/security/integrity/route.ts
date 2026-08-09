import { NextRequest } from "next/server";

import {
  checkIntegrity,
  updateIntegrityBaseline,
} from "@/lib/security/integrity";

import {
  getAdminSession,
} from "@/lib/auth/session";

import {
  apiMethodNotAllowed,
  apiServerError,
  apiUnauthorized,
  apiSuccess,
} from "@/lib/api/response";

// =====================================================
// GET
// Security Integrity Check
// =====================================================

export async function GET(
  _request: NextRequest
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
    // Run read-only integrity check
    // =================================================

    const result =
      checkIntegrity();

    // =================================================
    // Return result
    // =================================================

    return apiSuccess(
      {
        integrity: result,
      },
      "Integrity check completed.",
      200
    );
  } catch (error) {
    console.error(
      "SECURITY INTEGRITY CHECK ERROR:",
      error
    );

    return apiServerError(
      "Failed to check security integrity.",
      "INTEGRITY_CHECK_FAILED"
    );
  }
}

// =====================================================
// POST
// Update Trusted Integrity Baseline
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
    // Explicit confirmation is required
    // =================================================

    let body: unknown = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const confirmation =
      typeof body === "object" &&
      body !== null &&
      "confirmation" in body &&
      typeof (
        body as {
          confirmation?: unknown;
        }
      ).confirmation === "string"
        ? (
            body as {
              confirmation: string;
            }
          ).confirmation
        : "";

    if (
      confirmation !==
      "UPDATE_TRUSTED_BASELINE"
    ) {
      return apiSuccess(
        {
          updated: false,
          requiresConfirmation: true,
        },
        "Explicit baseline update confirmation is required.",
        400
      );
    }

    // =================================================
    // Inspect current integrity state first
    // =================================================

    const before =
      checkIntegrity();

    // =================================================
    // Missing or unreadable files must block baseline
    // update. Modified files are allowed because this
    // operation explicitly accepts the current code as
    // the new trusted version.
    // =================================================

    if (
      before.missing > 0 ||
      before.errors > 0
    ) {
      return apiSuccess(
        {
          updated: false,
          blocked: true,
          integrity: before,
        },
        "Trusted baseline cannot be updated while files are missing or unreadable.",
        409
      );
    }

    // =================================================
    // Update baseline
    // =================================================

    const result =
      updateIntegrityBaseline();

    // =================================================
    // Verify immediately after update
    // =================================================

    const after =
      checkIntegrity();

    if (
      after.modified !== 0 ||
      after.missing !== 0 ||
      after.errors !== 0
    ) {
      return apiServerError(
        "Trusted baseline update completed but verification failed.",
        "INTEGRITY_BASELINE_VERIFICATION_FAILED"
      );
    }

    // =================================================
    // Return verified result
    // =================================================

    return apiSuccess(
      {
        updated: true,
        backupPath:
          result.backupPath,
        generatedAt:
          result.generatedAt,
        protectedFiles:
          result.protectedFiles,
        integrity: after,
      },
      "Trusted integrity baseline updated and verified.",
      200
    );
  } catch (error) {
    console.error(
      "SECURITY INTEGRITY BASELINE UPDATE ERROR:",
      error
    );

    return apiServerError(
      "Failed to update trusted integrity baseline.",
      "INTEGRITY_BASELINE_UPDATE_FAILED"
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