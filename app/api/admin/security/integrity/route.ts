import { NextRequest } from "next/server";

import {
  checkIntegrity,
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
// OPTIONS
// =====================================================

export async function OPTIONS() {
  return apiMethodNotAllowed(
    "Method not allowed for this route.",
    "METHOD_NOT_ALLOWED"
  );
}
