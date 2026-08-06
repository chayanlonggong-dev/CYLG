import { prisma } from "@/lib/prisma";

export async function restoreAdminUsers(adminUsers: any[]) {
  if (!Array.isArray(adminUsers)) {
    return {
      success: false,
      message: "Invalid AdminUser data.",
    };
  }

  try {
    // 清空现有管理员
    await prisma.adminUser.deleteMany();

    // 没有资料
    if (adminUsers.length === 0) {
      return {
        success: true,
        restored: 0,
      };
    }

    // 恢复管理员
    await prisma.adminUser.createMany({
      data: adminUsers.map((user) => ({
        username: user.username,
        password: user.password,

        twoFactorEnabled:
          user.twoFactorEnabled ?? false,

        twoFactorSecret:
          user.twoFactorSecret ?? null,

        failedLoginAttempts:
          user.failedLoginAttempts ?? 0,

        lockedUntil: user.lockedUntil
          ? new Date(user.lockedUntil)
          : null,

        createdAt: user.createdAt
          ? new Date(user.createdAt)
          : new Date(),

        updatedAt: user.updatedAt
          ? new Date(user.updatedAt)
          : new Date(),
      })),
    });

    return {
      success: true,
      restored: adminUsers.length,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Failed to restore Admin Users.",
    };
  }
}