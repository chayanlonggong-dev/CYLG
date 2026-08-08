import { NextRequest } from "next/server";

import { requireAdminSession } from "@/lib/auth/session";
import {
  createAuditLog,
  type AuditAction,
} from "@/lib/audit/audit";

import {
  apiBadRequest,
  apiMethodNotAllowed,
  apiServerError,
  apiSuccess,
} from "@/lib/api/response";

import {
  parseRequestJson,
  isEmptyJsonBody,
} from "@/lib/api/request";

import { prisma } from "@/lib/prisma";

function getDateRange(range: string | null) {
  const now = new Date();

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  switch (range) {
    case "TODAY":
      return {
        gte: start,
        lte: end,
      };

    case "YESTERDAY": {
      const yesterdayStart = new Date(start);
      yesterdayStart.setDate(
        yesterdayStart.getDate() - 1
      );

      const yesterdayEnd = new Date(end);
      yesterdayEnd.setDate(
        yesterdayEnd.getDate() - 1
      );

      return {
        gte: yesterdayStart,
        lte: yesterdayEnd,
      };
    }

    case "LAST_7_DAYS": {
      const date = new Date(start);
      date.setDate(date.getDate() - 6);

      return {
        gte: date,
        lte: end,
      };
    }

    case "LAST_30_DAYS": {
      const date = new Date(start);
      date.setDate(date.getDate() - 29);

      return {
        gte: date,
        lte: end,
      };
    }

    case "LAST_90_DAYS": {
      const date = new Date(start);
      date.setDate(date.getDate() - 89);

      return {
        gte: date,
        lte: end,
      };
    }

    case "ALL_TIME":
      return undefined;

    default:
      return {
        gte: start,
        lte: end,
      };
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();

    const { searchParams } = new URL(request.url);

    const query =
      searchParams.get("q")?.trim() ?? "";

    const action =
      searchParams.get("action") ?? "ALL";

    const status =
      searchParams.get("status") ?? "ALL";

    const range =
      searchParams.get("range") ?? "TODAY";

    const dateRange = getDateRange(range);

    const logs = await prisma.auditLog.findMany({
      where: {
        ...(action !== "ALL"
          ? {
              action: action as AuditAction,
            }
          : {}),

        ...(dateRange
          ? {
              createdAt: dateRange,
            }
          : {}),
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 500,
    });

    const result = logs
      .map((log) => {
        let metadata: {
          operator?: string;
          result?: string;
          modelCode?: string;
          actionLabel?: string;
          ip?: string;
          browser?: string;
          os?: string;
          device?: string;
        } | null = null;

        try {
          metadata = log.metadata
            ? JSON.parse(log.metadata)
            : null;
        } catch {
          metadata = null;
        }

        return {
          ...log,
          metadata,
        };
      })
      .filter((log) => {
        // Status filter
        if (
          status !== "ALL" &&
          (log.metadata?.result ?? "Success") !== status
        ) {
          return false;
        }

        // Search filter
        if (query) {
          const searchText = [
            log.action,
            log.description,
            log.entity ?? "",
            log.entityId ?? "",
            log.userId ?? "",
            log.metadata?.operator ?? "",
            log.metadata?.modelCode ?? "",
            log.metadata?.actionLabel ?? "",
            log.metadata?.ip ?? "",
            log.metadata?.browser ?? "",
            log.metadata?.os ?? "",
            log.metadata?.device ?? "",
          ]
            .join(" ")
            .toLowerCase();

          if (!searchText.includes(query.toLowerCase())) {
            return false;
          }
        }

        return true;
      });

    return apiSuccess(
      result,
      "Audit logs retrieved successfully",
      200
    );
  } catch (error) {
    console.error(
      "Audit log fetch error:",
      error
    );

    return apiServerError(
      "Failed to fetch audit logs",
      "AUDIT_LOG_FETCH_FAILED"
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();

    const { body, error } =
      await parseRequestJson<
        Record<string, unknown>
      >(request);

    if (error === "INVALID_JSON") {
      return apiBadRequest(
        "Invalid JSON body.",
        "INVALID_JSON"
      );
    }

    if (!body || isEmptyJsonBody(body)) {
      return apiBadRequest(
        "Request body is required.",
        "EMPTY_BODY"
      );
    }

    const action =
      typeof body.action === "string"
        ? body.action
        : "UPDATE";

    const entity =
      typeof body.entity === "string"
        ? body.entity
        : "Model";

    const entityId =
      typeof body.entityId === "string" ||
      typeof body.entityId === "number"
        ? body.entityId
        : null;

    const description =
      typeof body.description === "string"
        ? body.description
        : "Admin action recorded.";

    const modelCode =
      typeof body.modelCode === "string"
        ? body.modelCode
        : null;

    const operator =
      typeof body.operator === "string"
        ? body.operator
        : "Admin";

    const result =
      typeof body.result === "string"
        ? body.result
        : "Success";

    const actionLabel =
      typeof body.actionLabel === "string"
        ? body.actionLabel
        : action;

    const userId =
      typeof body.userId === "string"
        ? body.userId
        : String(session.adminUserId);

    const log = await createAuditLog({
      action: action as AuditAction,
      entity,
      entityId:
        entityId as string | number | undefined,
      userId,
      description,
      metadata: {
        modelCode,
        operator,
        result,
        actionLabel,
      },
    });

    return apiSuccess(
      log,
      "Audit log created successfully",
      201
    );
  } catch (error) {
    console.error(
      "Audit log create error:",
      error
    );

    return apiServerError(
      "Failed to create audit log",
      "AUDIT_LOG_CREATE_FAILED"
    );
  }
}

export async function DELETE() {
  try {
    await requireAdminSession();

    await prisma.auditLog.deleteMany({});

    return apiSuccess(
      null,
      "Audit logs cleared successfully",
      200
    );
  } catch (error) {
    console.error(
      "Audit log clear error:",
      error
    );

    return apiServerError(
      "Failed to clear audit logs",
      "AUDIT_LOG_CLEAR_FAILED"
    );
  }
}

export async function OPTIONS() {
  return apiMethodNotAllowed(
    "Method not allowed for this route.",
    "METHOD_NOT_ALLOWED"
  );
}