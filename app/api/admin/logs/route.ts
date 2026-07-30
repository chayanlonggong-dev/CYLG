import { NextRequest, NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/session";
import { createAuditLog, type AuditAction } from "@/lib/audit/audit";
import { apiBadRequest, apiMethodNotAllowed, apiServerError, apiSuccess } from "@/lib/api/response";
import { parseRequestJson, isEmptyJsonBody } from "@/lib/api/request";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdminSession();

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const result = logs.map((log) => ({
      ...log,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
    }));

    return apiSuccess(result, "Audit logs retrieved successfully", 200);
  } catch (error) {
    console.error("Audit log fetch error:", error);
    return apiServerError("Failed to fetch audit logs", "AUDIT_LOG_FETCH_FAILED");
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    const { body, error } = await parseRequestJson<Record<string, unknown>>(request);

    if (error === "INVALID_JSON") {
      return apiBadRequest("Invalid JSON body.", "INVALID_JSON");
    }

    if (!body || isEmptyJsonBody(body)) {
      return apiBadRequest("Request body is required.", "EMPTY_BODY");
    }

    const action = typeof body.action === "string" ? body.action : "UPDATE";
    const entity = typeof body.entity === "string" ? body.entity : "Model";
    const entityId = typeof body.entityId === "string" || typeof body.entityId === "number" ? body.entityId : null;
    const description = typeof body.description === "string" ? body.description : "Admin action recorded.";
    const modelCode = typeof body.modelCode === "string" ? body.modelCode : null;
    const operator = typeof body.operator === "string" ? body.operator : "Admin";
    const result = typeof body.result === "string" ? body.result : "Success";
    const actionLabel = typeof body.actionLabel === "string" ? body.actionLabel : action;
    const userId = typeof body.userId === "string" ? body.userId : String(session.adminUserId);

    const log = await createAuditLog({
      action: action as AuditAction,
      entity,
      entityId: entityId as string | number | undefined,
      userId,
      description,
      metadata: {
        modelCode,
        operator,
        result,
        actionLabel,
      },
    });

    return apiSuccess(log, "Audit log created successfully", 201);
  } catch (error) {
    console.error("Audit log create error:", error);
    return apiServerError("Failed to create audit log", "AUDIT_LOG_CREATE_FAILED");
  }
}

export async function DELETE() {
  try {
    await requireAdminSession();
    await prisma.auditLog.deleteMany({});
    return apiSuccess(null, "Audit logs cleared successfully", 200);
  } catch (error) {
    console.error("Audit log clear error:", error);
    return apiServerError("Failed to clear audit logs", "AUDIT_LOG_CLEAR_FAILED");
  }
}

export async function OPTIONS() {
  return apiMethodNotAllowed("Method not allowed for this route.", "METHOD_NOT_ALLOWED");
}