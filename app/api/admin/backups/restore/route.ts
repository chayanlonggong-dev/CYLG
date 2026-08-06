import { NextRequest, NextResponse } from "next/server";

import { restoreModels } from "./restore-models";
import { restoreWebsiteSettings } from "./restore-settings";
import { restoreAdminUsers } from "./restore-admin-users";
import { restoreAuditLogs } from "./restore-audit-logs";
import { restoreAnalytics } from "./restore-analytics";

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

    // Restore Models
    const modelResult = await restoreModels(
      backup.data.models ?? []
    );

    if (!modelResult.success) {
      return NextResponse.json(modelResult, {
        status: 500,
      });
    }

    // Restore Website Settings
    const settingsResult =
      await restoreWebsiteSettings(
        backup.data.websiteSettings ?? []
      );

    if (!settingsResult.success) {
      return NextResponse.json(settingsResult, {
        status: 500,
      });
    }

    // Restore Admin Users
    const adminResult =
      await restoreAdminUsers(
        backup.data.adminUsers ?? []
      );

    if (!adminResult.success) {
      return NextResponse.json(adminResult, {
        status: 500,
      });
    }

    // Restore Audit Logs
    const auditResult =
      await restoreAuditLogs(
        backup.data.auditLogs ?? []
      );

    if (!auditResult.success) {
      return NextResponse.json(auditResult, {
        status: 500,
      });
    }

    // Restore Analytics
    const analyticsResult =
      await restoreAnalytics(
        backup.data.analytics ?? []
      );

    if (!analyticsResult.success) {
      return NextResponse.json(analyticsResult, {
        status: 500,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Backup restored successfully.",
      restored: {
        models: modelResult.restored,
        websiteSettings: settingsResult.restored,
        adminUsers: adminResult.restored,
        auditLogs: auditResult.restored,
        analytics: analyticsResult.restored,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to restore backup.",
      },
      {
        status: 500,
      }
    );
  }
}