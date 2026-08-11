import { prisma } from "@/lib/prisma";

type BackupAdminUser = {
  id?: number;
  username: string;
  password: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string | null;
  failedLoginAttempts?: number;
  lockedUntil?: string | Date | null;
};

export async function restoreAdminUsers(
  adminUsers: BackupAdminUser[]
) {
  if (!Array.isArray(adminUsers)) {
    return {
      success: false,
      message: "Invalid AdminUser data.",
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      /*
       * Sessions are intentionally NOT restored.
       *
       * Session tokens are active authentication credentials
       * and must never be imported from a portable backup.
       *
       * Existing sessions are removed first so that the restored
       * administrators must authenticate again.
       */
      await tx.session.deleteMany();

      /*
       * Remove the current administrator records before restoring
       * the administrator records contained in the backup.
       */
      await tx.adminUser.deleteMany();

      if (adminUsers.length === 0) {
        return {
          restored: 0,
        };
      }

      const data = adminUsers.map((admin) => ({
        ...(typeof admin.id === "number"
          ? { id: admin.id }
          : {}),

        username:
          typeof admin.username === "string"
            ? admin.username
            : "",

        password:
          typeof admin.password === "string"
            ? admin.password
            : "",

        createdAt: admin.createdAt
          ? new Date(admin.createdAt)
          : new Date(),

        updatedAt: admin.updatedAt
          ? new Date(admin.updatedAt)
          : new Date(),

        twoFactorEnabled:
          typeof admin.twoFactorEnabled === "boolean"
            ? admin.twoFactorEnabled
            : false,

        twoFactorSecret:
          admin.twoFactorSecret ?? null,

        failedLoginAttempts:
          typeof admin.failedLoginAttempts === "number"
            ? admin.failedLoginAttempts
            : 0,

        lockedUntil:
          admin.lockedUntil
            ? new Date(admin.lockedUntil)
            : null,
      }));

      await tx.adminUser.createMany({
        data,
      });

      /*
       * The AdminUser primary key is PostgreSQL auto-incremented.
       *
       * Because backup restore may insert explicit IDs, synchronize
       * the PostgreSQL sequence with the restored maximum ID so that
       * the next newly-created administrator does not collide.
       */
      await tx.$executeRawUnsafe(`
        SELECT setval(
          pg_get_serial_sequence('"AdminUser"', 'id'),
          COALESCE(
            (SELECT MAX(id) FROM "AdminUser"),
            1
          ),
          CASE
            WHEN EXISTS (
              SELECT 1
              FROM "AdminUser"
            )
            THEN true
            ELSE false
          END
        );
      `);

      return {
        restored: adminUsers.length,
      };
    });

    return {
      success: true,
      restored: result.restored,
    };
  } catch (error) {
    console.error(
      "RESTORE ADMIN USERS ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Failed to restore Admin Users.",
    };
  }
}