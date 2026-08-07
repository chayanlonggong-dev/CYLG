import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/lib/prisma";

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
  apiForbidden,
  apiMethodNotAllowed,
  apiNotFound,
  apiServerError,
  apiUnauthorized,
  apiError,
  apiSuccess,
} from "@/lib/api/response";

import {
  isEmptyJsonBody,
  parseRequestJson,
} from "@/lib/api/request";

function getClientIp(request: NextRequest) {
  return (
    request.headers
      .get("x-forwarded-for")
      ?.split(",")[0]
      ?.trim() ||
    "unknown"
  );
}

// =========================
// GET ALL ADMIN SESSIONS
// =========================

export async function GET(request: NextRequest) {
  try {
    const currentSession = await getAdminSession();

    if (!currentSession) {
      return apiUnauthorized("Unauthorized.", "UNAUTHORIZED");
    }

    const ip = getClientIp(request);

    const limit = rateLimit(
      `admin-sessions-get:${ip}`,
      {
        limit: 60,
        windowMs: 60 * 1000,
      }
    );

    if (!limit.success) {
      return apiError("Too many requests.", 429, "RATE_LIMITED");
    }

    const sessions = await prisma.session.findMany({
      where: {
        adminUserId: currentSession.adminUserId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        ip: true,
        userAgent: true,
        createdAt: true,
        lastActivityAt: true,
        expiresAt: true,
      },
    });

    return apiSuccess(
      {
        sessions,
        currentSessionId: currentSession.sessionId,
      },
      "Sessions fetched.",
      200
    );
  } catch (error) {
    console.error("GET ADMIN SESSIONS ERROR:", error);
    return apiServerError("Failed to fetch sessions.", "FETCH_SESSIONS_FAILED");
  }
}

// =========================
// DELETE SESSION
// =========================

export async function DELETE(request: NextRequest) {
  try {
    const currentSession = await getAdminSession();

    if (!currentSession) {
      return apiUnauthorized("Unauthorized.", "UNAUTHORIZED");
    }

    const ip = getClientIp(request);

    const limit = rateLimit(
      `admin-session-delete:${ip}`,
      {
        limit: 20,
        windowMs: 60 * 60 * 1000,
      }
    );

    if (!limit.success) {
      return apiError(
        "Too many requests.",
        429,
        "RATE_LIMITED"
      );
    }

    const parsedBody =
      await parseRequestJson<Record<string, unknown>>(request);

    if (parsedBody.error === "INVALID_JSON") {
      return apiBadRequest(
        "Invalid JSON body.",
        "INVALID_JSON"
      );
    }

    if (
      !parsedBody.body ||
      isEmptyJsonBody(parsedBody.body)
    ) {
      return apiBadRequest(
        "Request body is required.",
        "EMPTY_BODY"
      );
    }

    const body =
      parsedBody.body as Record<string, unknown>;

    const action =
      typeof body.action === "string"
        ? body.action
        : "";

    const sessionId =
      typeof body.sessionId === "string"
        ? body.sessionId
        : "";

    // =====================================
    // Logout All Devices
    // =====================================

    if (action === "logoutAll") {
      await prisma.session.deleteMany({
        where: {
          adminUserId:
            currentSession.adminUserId,
        },
      });

      createAuditLog({
        action: "DELETE",
        entity: "Session",
        entityId: "ALL",
        userId: String(
          currentSession.adminUserId
        ),
        description:
          "Logout all devices.",
        metadata: {
          ip,
        },
      });

      return apiSuccess(
        null,
        "All devices logged out.",
        200
      );
    }

    // =====================================
    // Logout All Other Devices
    // =====================================

    if (action === "logoutOthers") {
      await prisma.session.deleteMany({
        where: {
          adminUserId:
            currentSession.adminUserId,
          NOT: {
            id: currentSession.sessionId,
          },
        },
      });

      createAuditLog({
        action: "DELETE",
        entity: "Session",
        entityId: "OTHERS",
        userId: String(
          currentSession.adminUserId
        ),
        description:
          "Logout all other devices.",
        metadata: {
          ip,
        },
      });

      return apiSuccess(
        null,
        "Other devices logged out.",
        200
      );
    }

    // =====================================
    // Logout Single Device
    // =====================================

    if (!sessionId) {
      return apiBadRequest(
        "Session ID required.",
        "MISSING_SESSION_ID"
      );
    }

    const targetSession =
      await prisma.session.findUnique({
        where: {
          id: sessionId,
        },
      });

    if (!targetSession) {
      return apiNotFound(
        "Session not found.",
        "SESSION_NOT_FOUND"
      );
    }

    if (
      targetSession.adminUserId !==
      currentSession.adminUserId
    ) {
      return apiForbidden(
        "Forbidden.",
        "FORBIDDEN"
      );
    }

    await prisma.session.delete({
      where: {
        id: sessionId,
      },
    });

    createAuditLog({
      action: "DELETE",
      entity: "Session",
      entityId: sessionId,
      userId: String(
        currentSession.adminUserId
      ),
      description:
        "Admin session revoked.",
      metadata: {
        ip,
      },
    });

    return apiSuccess(
      null,
      "Session revoked.",
      200
    );
  } catch (error) {
    console.error(
      "DELETE ADMIN SESSION ERROR:",
      error
    );

    return apiServerError(
      "Failed to revoke session.",
      "REVOKE_SESSION_FAILED"
    );
  }
}