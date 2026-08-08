import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth/session";
import { createAuditLog } from "@/lib/audit/audit";

export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        {
          status: 401,
        }
      );
    }

    const [
      models,
      websiteSettings,
      adminUsers,
      auditLogs,
      analytics,
    ] = await Promise.all([
      prisma.model.findMany(),
      prisma.websiteSettings.findMany(),
      prisma.adminUser.findMany(),
      prisma.auditLog.findMany(),
      prisma.analyticsVisit.findMany(),
    ]);

    /*
     * Sessions are intentionally excluded.
     *
     * A session contains a live authentication token.
     * Exporting session tokens would make the backup
     * itself a potential authentication credential.
     *
     * Restored administrators will log in again.
     */

    const backup = {
      exportedAt: new Date().toISOString(),

      version: "1.0.0",

      application: "ChaYanLongGong",

      database: "PostgreSQL",

      schema: "public",

      data: {
        models,
        websiteSettings,
        adminUsers,
        auditLogs,
        analytics,
      },
    };

    const json = JSON.stringify(
      backup,
      null,
      2
    );

    const fileName =
      `CYLG-DB-${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.json`;

    await createAuditLog({
      action: "CREATE",
      entity: "BackupRecord",
      entityId: undefined,
      userId: String(session.adminUserId),
      description:
        "Database backup exported for download.",
      metadata: {
        filename: fileName,
        operator: session.username,
        result: "Success",
        actionLabel: "EXPORT_BACKUP",
      },
    });

    return new NextResponse(
      json,
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/json; charset=utf-8",

          "Content-Disposition":
            `attachment; filename="${fileName}"`,

          "Cache-Control":
            "private, no-store, max-age=0",

          "X-Content-Type-Options":
            "nosniff",
        },
      }
    );
  } catch (error) {
    console.error(
      "DATABASE EXPORT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to export database.",
      },
      {
        status: 500,
      }
    );
  }
}