import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      models,
      websiteSettings,
      adminUsers,
      sessions,
      auditLogs,
      analytics,
    ] = await Promise.all([
      prisma.model.findMany(),
      prisma.websiteSettings.findMany(),
      prisma.adminUser.findMany(),
      prisma.session.findMany(),
      prisma.auditLog.findMany(),
      prisma.analyticsVisit.findMany(),
    ]);

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
        sessions,
        auditLogs,
        analytics,
      },
    };

    return new NextResponse(
      JSON.stringify(backup, null, 2),
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/json",

          "Content-Disposition":
            `attachment; filename="CYLG-DB-${new Date()
              .toISOString()
              .replace(/[:.]/g, "-")}.json"`,
        },
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to export database.",
      },
      {
        status: 500,
      }
    );
  }
}