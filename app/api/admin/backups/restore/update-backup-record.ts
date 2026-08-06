import { prisma } from "@/lib/prisma";

export async function updateBackupRecord(
  filename: string,
  restoredBy = "Administrator"
) {
  try {
    const backup = await prisma.backupRecord.findFirst({
      where: {
        filename,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!backup) {
      return {
        success: false,
        message: "Backup record not found.",
      };
    }

    await prisma.backupRecord.update({
      where: {
        id: backup.id,
      },
      data: {
        status: "Restored",
        restoredAt: new Date(),
        restoredBy,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Failed to update backup record.",
    };
  }
}