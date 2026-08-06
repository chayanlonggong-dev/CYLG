import { prisma } from "@/lib/prisma";

export async function restoreAuditLogs(auditLogs: any[]) {
  if (!Array.isArray(auditLogs)) {
    return {
      success: false,
      message: "Invalid AuditLog data.",
    };
  }

  try {
    await prisma.auditLog.deleteMany();

    if (auditLogs.length === 0) {
      return {
        success: true,
        restored: 0,
      };
    }

    await prisma.auditLog.createMany({
      data: auditLogs.map((log) => ({
        action: log.action,
        entity: log.entity ?? null,
        entityId: log.entityId ?? null,
        userId: log.userId ?? null,
        description: log.description ?? "",
        metadata: log.metadata ?? null,

        createdAt: log.createdAt
          ? new Date(log.createdAt)
          : new Date(),
      })),
    });

    return {
      success: true,
      restored: auditLogs.length,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Failed to restore Audit Logs.",
    };
  }
}