import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/session";
import { apiSuccess, apiServerError } from "@/lib/api/response";

export async function GET() {
  try {
    await requireAdminSession();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalLogs = await prisma.auditLog.count();

    const todayLogs = await prisma.auditLog.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    const failedLogins = await prisma.auditLog.count({
      where: {
        action: "LOGIN",
        metadata: {
          contains: '"result":"Failed"',
        },
      },
    });

    const errors = await prisma.auditLog.count({
      where: {
        metadata: {
          contains: '"result":"Failed"',
        },
      },
    });

    const warnings = await prisma.auditLog.count({
      where: {
        metadata: {
          contains: '"result":"Warning"',
        },
      },
    });

    return apiSuccess({
      totalLogs,
      todayLogs,
      failedLogins,
      errors,
      warnings,
    });
  } catch (error) {
    console.error(error);

    return apiServerError(
      "Failed to load log statistics",
      "LOG_STATS_FAILED"
    );
  }
}