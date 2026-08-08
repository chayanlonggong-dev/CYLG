import { NextRequest, NextResponse } from "next/server";

import { restoreModels } from "./restore-models";
import { restoreWebsiteSettings } from "./restore-settings";
import { restoreAdminUsers } from "./restore-admin-users";
import { restoreAuditLogs } from "./restore-audit-logs";
import { restoreAnalytics } from "./restore-analytics";

import { getAdminSession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rateLimit";
import { createAuditLog } from "@/lib/audit/audit";

export async function POST(request: NextRequest) {
  try {
    // =========================================
    // 1. Verify Admin Session
    // =========================================

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

    // =========================================
    // 2. Rate Limit Restore
    // =========================================

    const limit = rateLimit(
      `admin-backup-restore:${session.adminUserId}`,
      {
        limit: 5,
        windowMs: 60 * 60 * 1000,
      }
    );

    if (!limit.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many restore attempts. Please try again later.",
        },
        {
          status: 429,
        }
      );
    }

    // =========================================
    // 3. Read Backup JSON
    // =========================================

    const backup = await request.json();

    // =========================================
    // 4. Validate Backup Object
    // =========================================

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

    // =========================================
    // 5. Validate Application
    // =========================================

    if (
      backup.application !==
      "ChaYanLongGong"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This backup does not belong to ChaYanLongGong.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================
    // 6. Validate Database
    // =========================================

    if (
      backup.database !==
      "PostgreSQL"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unsupported database type.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================
    // 7. Validate Backup Version
    // =========================================

    if (
      backup.version !==
      "1.0.0"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unsupported backup version.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================
    // 8. Validate Backup Data
    // =========================================

    if (
      typeof backup.data !== "object" ||
      backup.data === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid backup data.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================
    // 9. Audit Restore Start
    // =========================================

    await createAuditLog({
      action: "UPDATE",
      entity: "Backup",
      entityId: "DATABASE",
      userId: String(
        session.adminUserId
      ),
      description:
        "Admin started database restore.",
      metadata: {
        version:
          backup.version,
        application:
          backup.application,
      },
    });

    // =========================================
    // 10. Restore Models
    // =========================================

    const modelResult =
      await restoreModels(
        Array.isArray(
          backup.data.models
        )
          ? backup.data.models
          : []
      );

    if (!modelResult.success) {
      return NextResponse.json(
        modelResult,
        {
          status: 500,
        }
      );
    }

    // =========================================
    // 11. Restore Website Settings
    // =========================================

    const settingsResult =
      await restoreWebsiteSettings(
        Array.isArray(
          backup.data
            .websiteSettings
        )
          ? backup.data
              .websiteSettings
          : []
      );

    if (!settingsResult.success) {
      return NextResponse.json(
        settingsResult,
        {
          status: 500,
        }
      );
    }

    // =========================================
    // 12. Restore Admin Users
    // =========================================

    const adminResult =
      await restoreAdminUsers(
        Array.isArray(
          backup.data.adminUsers
        )
          ? backup.data.adminUsers
          : []
      );

    if (!adminResult.success) {
      return NextResponse.json(
        adminResult,
        {
          status: 500,
        }
      );
    }

    // =========================================
    // 13. Restore Audit Logs
    // =========================================

    const auditResult =
      await restoreAuditLogs(
        Array.isArray(
          backup.data.auditLogs
        )
          ? backup.data.auditLogs
          : []
      );

    if (!auditResult.success) {
      return NextResponse.json(
        auditResult,
        {
          status: 500,
        }
      );
    }

    // =========================================
    // 14. Restore Analytics
    // =========================================

    const analyticsResult =
      await restoreAnalytics(
        Array.isArray(
          backup.data.analytics
        )
          ? backup.data.analytics
          : []
      );

    if (!analyticsResult.success) {
      return NextResponse.json(
        analyticsResult,
        {
          status: 500,
        }
      );
    }

    // =========================================
    // 15. Return Result
    // =========================================

    return NextResponse.json(
      {
        success: true,
        message:
          "Backup restored successfully.",
        restored: {
          models:
            modelResult.restored,
          websiteSettings:
            settingsResult.restored,
          adminUsers:
            adminResult.restored,
          auditLogs:
            auditResult.restored,
          analytics:
            analyticsResult.restored,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "DATABASE RESTORE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to restore backup.",
      },
      {
        status: 500,
      }
    );
  }
}