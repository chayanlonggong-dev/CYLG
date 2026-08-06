import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const backup = await request.json();

    // Validate backup object
    if (
      typeof backup !== "object" ||
      backup === null ||
      !backup.version ||
      !backup.application ||
      !backup.database ||
      !backup.schema ||
      !backup.data
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid backup file.",
        },
        {
          status: 400,
        }
      );
    }

    // Validate application
    if (backup.application !== "ChaYanLongGong") {
      return NextResponse.json(
        {
          success: false,
          message: "This backup does not belong to ChaYanLongGong.",
        },
        {
          status: 400,
        }
      );
    }

    // Validate database
    if (backup.database !== "PostgreSQL") {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported database type.",
        },
        {
          status: 400,
        }
      );
    }

    // Validate version
    if (backup.version !== "1.0.0") {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported backup version.",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Backup file verified successfully.",
      info: {
        version: backup.version,
        application: backup.application,
        database: backup.database,
        schema: backup.schema,
        exportedAt: backup.exportedAt,

        models: backup.data.models?.length ?? 0,
        websiteSettings:
          backup.data.websiteSettings?.length ?? 0,
        adminUsers:
          backup.data.adminUsers?.length ?? 0,
        sessions:
          backup.data.sessions?.length ?? 0,
        auditLogs:
          backup.data.auditLogs?.length ?? 0,
        analytics:
          backup.data.analytics?.length ?? 0,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to parse backup file.",
      },
      {
        status: 500,
      }
    );
  }
}