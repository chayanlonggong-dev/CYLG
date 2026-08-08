import { NextRequest, NextResponse } from "next/server";

import fs from "fs";
import path from "path";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit/audit";

export const dynamic = "force-dynamic";

const DATABASE_BACKUP_DIR = path.join(
  process.cwd(),
  "backup",
  "database"
);

const MEDIA_BACKUP_DIR = path.join(
  process.cwd(),
  "backup",
  "media"
);

const imageExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
];

const videoExtensions = [
  ".mp4",
  ".mov",
  ".avi",
  ".webm",
  ".mkv",
];

type SchedulerConfig = {
  enabled: boolean;
  day: string;
  time: string;
  retention: number;
};

/**
 * Get CRON secret from environment.
 */
function getCronSecret(): string | undefined {
  return process.env.CRON_SECRET;
}

/**
 * Validate Authorization header.
 *
 * Expected:
 *
 * Authorization: Bearer <CRON_SECRET>
 */
function isAuthorized(
  request: NextRequest
): boolean {
  const secret = getCronSecret();

  if (!secret) {
    return false;
  }

  const authorization =
    request.headers.get("authorization");

  if (!authorization) {
    return false;
  }

  return (
    authorization ===
    `Bearer ${secret}`
  );
}

/**
 * Load Backup Scheduler configuration
 * from PostgreSQL.
 *
 * BackupScheduler is the production
 * source of truth.
 */
async function loadSchedulerConfig(): Promise<SchedulerConfig> {
  const scheduler =
    await prisma.backupScheduler.findUnique({
      where: {
        id: 1,
      },
    });

  /**
   * Create default scheduler record
   * if it does not exist.
   */
  if (!scheduler) {
    const created =
      await prisma.backupScheduler.create({
        data: {
          id: 1,
          enabled: false,
          day: "Sunday",
          time: "03:00",
          retention: 8,
        },
      });

    return {
      enabled: created.enabled,
      day: created.day,
      time: created.time,
      retention: Math.max(
        1,
        Math.min(
          52,
          created.retention
        )
      ),
    };
  }

  return {
    enabled: scheduler.enabled,

    day: scheduler.day,

    time: scheduler.time,

    retention: Math.max(
      1,
      Math.min(
        52,
        scheduler.retention
      )
    ),
  };
}

/**
 * Get current UTC day name.
 */
function getCurrentDayName(): string {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      weekday: "long",
      timeZone: "UTC",
    }
  ).format(new Date());
}

/**
 * Get current UTC time.
 *
 * Always returns HH:mm.
 *
 * Midnight is normalized from
 * possible "24:00" to "00:00".
 */
function getCurrentTime(): string {
  const parts =
    new Intl.DateTimeFormat(
      "en-GB",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      }
    ).formatToParts(
      new Date()
    );

  const hour =
    parts.find(
      (part) =>
        part.type === "hour"
    )?.value ?? "00";

  const minute =
    parts.find(
      (part) =>
        part.type === "minute"
    )?.value ?? "00";

  const normalizedHour =
    hour === "24"
      ? "00"
      : hour;

  return `${normalizedHour}:${minute}`;
}

/**
 * Copy supported media files recursively.
 */
function copyMedia(
  source: string,
  destination: string
): void {
  if (!fs.existsSync(source)) {
    return;
  }

  fs.mkdirSync(destination, {
    recursive: true,
  });

  const files =
    fs.readdirSync(source);

  for (const file of files) {
    const sourcePath =
      path.join(
        source,
        file
      );

    const destinationPath =
      path.join(
        destination,
        file
      );

    const stat =
      fs.statSync(
        sourcePath
      );

    if (stat.isDirectory()) {
      copyMedia(
        sourcePath,
        destinationPath
      );

      continue;
    }

    const extension =
      path
        .extname(file)
        .toLowerCase();

    if (
      imageExtensions.includes(
        extension
      ) ||
      videoExtensions.includes(
        extension
      )
    ) {
      fs.copyFileSync(
        sourcePath,
        destinationPath
      );
    }
  }
}

/**
 * Count images and videos.
 */
function countMedia(
  directory: string
): {
  images: number;
  videos: number;
} {
  let images = 0;
  let videos = 0;

  if (
    !fs.existsSync(directory)
  ) {
    return {
      images,
      videos,
    };
  }

  const files =
    fs.readdirSync(
      directory
    );

  for (const file of files) {
    const fullPath =
      path.join(
        directory,
        file
      );

    const stat =
      fs.statSync(
        fullPath
      );

    if (stat.isDirectory()) {
      const nested =
        countMedia(
          fullPath
        );

      images += nested.images;
      videos += nested.videos;

      continue;
    }

    const extension =
      path
        .extname(file)
        .toLowerCase();

    if (
      imageExtensions.includes(
        extension
      )
    ) {
      images++;
    }

    if (
      videoExtensions.includes(
        extension
      )
    ) {
      videos++;
    }
  }

  return {
    images,
    videos,
  };
}

/**
 * Create database backup.
 */
async function createDatabaseBackup() {
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
    exportedAt:
      new Date().toISOString(),

    version:
      "1.0.0",

    application:
      "ChaYanLongGong",

    database:
      "PostgreSQL",

    schema:
      "public",

    data: {
      models,
      websiteSettings,
      adminUsers,
      sessions,
      auditLogs,
      analytics,
    },
  };

  fs.mkdirSync(
    DATABASE_BACKUP_DIR,
    {
      recursive: true,
    }
  );

  const fileName =
    `CYLG-DB-${new Date()
      .toISOString()
      .replace(
        /[:.]/g,
        "-"
      )}.json`;

  const filePath =
    path.join(
      DATABASE_BACKUP_DIR,
      fileName
    );

  const json =
    JSON.stringify(
      backup,
      null,
      2
    );

  fs.writeFileSync(
    filePath,
    json,
    "utf8"
  );

  const stat =
    fs.statSync(
      filePath
    );

  const checksum =
    crypto
      .createHash(
        "sha256"
      )
      .update(json)
      .digest("hex");

  const size =
    Math.max(
      1,
      Math.round(
        stat.size / 1024
      )
    );

  const record =
    await prisma.backupRecord.create({
      data: {
        filename:
          fileName,

        type:
          "Database",

        size,

        filePath,

        checksum,

        status:
          "Completed",
      },
    });

  return {
    record,
    filename:
      fileName,
    size,
    checksum,
  };
}

/**
 * Create media backup.
 */
async function createMediaBackup() {
  const publicDir =
    path.join(
      process.cwd(),
      "public"
    );

  if (
    !fs.existsSync(
      publicDir
    )
  ) {
    throw new Error(
      "Public media directory not found."
    );
  }

  fs.mkdirSync(
    MEDIA_BACKUP_DIR,
    {
      recursive: true,
    }
  );

  const now =
    new Date();

  const folderName =
    `${now.getUTCFullYear()}-${
      String(
        now.getUTCMonth() + 1
      ).padStart(
        2,
        "0"
      )
    }-${
      String(
        now.getUTCDate()
      ).padStart(
        2,
        "0"
      )
    }-${
      String(
        now.getUTCHours()
      ).padStart(
        2,
        "0"
      )
    }${
      String(
        now.getUTCMinutes()
      ).padStart(
        2,
        "0"
      )
    }${
      String(
        now.getUTCSeconds()
      ).padStart(
        2,
        "0"
      )
    }`;

  const backupFolder =
    path.join(
      MEDIA_BACKUP_DIR,
      folderName
    );

  copyMedia(
    publicDir,
    backupFolder
  );

  const {
    images,
    videos,
  } =
    countMedia(
      backupFolder
    );

  const total =
    images + videos;

  const record =
    await prisma.backupRecord.create({
      data: {
        filename:
          folderName,

        type:
          "Media",

        size:
          total,

        filePath:
          backupFolder,

        checksum:
          "",

        status:
          "Completed",
      },
    });

  return {
    record,

    folderName,

    images,

    videos,

    total,
  };
}

/**
 * Apply retention separately
 * to Database and Media backups.
 */
async function applyRetention(
  retention: number
): Promise<string[]> {
  const records =
    await prisma.backupRecord.findMany({
      orderBy: {
        createdAt:
          "desc",
      },
    });

  const databaseRecords =
    records.filter(
      (record) =>
        record.type ===
        "Database"
    );

  const mediaRecords =
    records.filter(
      (record) =>
        record.type ===
        "Media"
    );

  const deleted: string[] =
    [];

  async function processRecords(
    oldRecords:
      typeof records
  ) {
    const recordsToDelete =
      oldRecords.slice(
        retention
      );

    for (
      const record of
        recordsToDelete
    ) {
      try {
        if (
          record.filePath &&
          fs.existsSync(
            record.filePath
          )
        ) {
          const stat =
            fs.statSync(
              record.filePath
            );

          if (
            stat.isDirectory()
          ) {
            fs.rmSync(
              record.filePath,
              {
                recursive:
                  true,
                force:
                  true,
              }
            );
          } else {
            fs.unlinkSync(
              record.filePath
            );
          }
        } else if (
          record.type ===
          "Database"
        ) {
          const fallbackPath =
            path.join(
              DATABASE_BACKUP_DIR,
              record.filename
            );

          if (
            fs.existsSync(
              fallbackPath
            )
          ) {
            fs.unlinkSync(
              fallbackPath
            );
          }
        } else if (
          record.type ===
          "Media"
        ) {
          const fallbackPath =
            path.join(
              MEDIA_BACKUP_DIR,
              record.filename
            );

          if (
            fs.existsSync(
              fallbackPath
            )
          ) {
            fs.rmSync(
              fallbackPath,
              {
                recursive:
                  true,
                force:
                  true,
              }
            );
          }
        }

        await prisma.backupRecord.delete({
          where: {
            id:
              record.id,
          },
        });

        deleted.push(
          record.id
        );
      } catch (error) {
        console.error(
          "RETENTION DELETE ERROR:",
          error
        );
      }
    }
  }

  await processRecords(
    databaseRecords
  );

  await processRecords(
    mediaRecords
  );

  return deleted;
}

/**
 * Cron endpoint.
 *
 * Vercel Cron sends:
 *
 * Authorization:
 * Bearer <CRON_SECRET>
 */
export async function GET(
  request: NextRequest
) {
  try {
    /**
     * 1. Authentication
     */
    if (
      !isAuthorized(
        request
      )
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Unauthorized cron request.",
        },
        {
          status:
            401,
        }
      );
    }

    /**
     * 2. Load scheduler
     *    from PostgreSQL.
     */
    const config =
      await loadSchedulerConfig();

    /**
     * 3. Check enabled.
     */
    if (
      !config.enabled
    ) {
      return NextResponse.json({
        success:
          true,

        skipped:
          true,

        message:
          "Automatic backup is disabled.",

        scheduler: {
          enabled:
            config.enabled,

          day:
            config.day,

          time:
            config.time,

          retention:
            config.retention,
        },
      });
    }

    /**
     * 4. Get current UTC
     *    schedule.
     */
    const currentDay =
      getCurrentDayName();

    const currentTime =
      getCurrentTime();

    /**
     * 5. Check scheduled day.
     */
    if (
      currentDay !==
      config.day
    ) {
      return NextResponse.json({
        success:
          true,

        skipped:
          true,

        reason:
          "Scheduled day does not match.",

        currentDay,

        scheduledDay:
          config.day,

        currentTime,

        scheduledTime:
          config.time,
      });
    }

    /**
     * 6. Check scheduled time.
     */
    if (
      currentTime !==
      config.time
    ) {
      return NextResponse.json({
        success:
          true,

        skipped:
          true,

        reason:
          "Scheduled time does not match.",

        currentDay,

        scheduledDay:
          config.day,

        currentTime,

        scheduledTime:
          config.time,
      });
    }

    /**
     * 7. Database backup.
     */
    const databaseBackup =
      await createDatabaseBackup();

    /**
     * 8. Media backup.
     */
    const mediaBackup =
      await createMediaBackup();

    /**
     * 9. Retention cleanup.
     */
    const deleted =
      await applyRetention(
        config.retention
      );

    /**
     * 10. Audit log.
     */
    await createAuditLog({
      action:
        "CREATE",

      entity:
        "Backup",

      entityId:
        databaseBackup
          .record.id,

      description:
        "Automatic scheduled backup completed.",

      metadata: {
        operator:
          "System Scheduler",

        result:
          "Success",

        actionLabel:
          "AUTOMATIC_BACKUP",

        databaseBackup:
          databaseBackup
            .filename,

        mediaBackup:
          mediaBackup
            .folderName,

        mediaImages:
          mediaBackup
            .images,

        mediaVideos:
          mediaBackup
            .videos,

        retention:
          config.retention,

        deletedBackups:
          deleted.length,
      },
    });

    /**
     * 11. Final response.
     */
    return NextResponse.json({
      success:
        true,

      message:
        "Automatic backup completed.",

      scheduler: {
        enabled:
          config.enabled,

        day:
          config.day,

        time:
          config.time,

        retention:
          config.retention,

        timezone:
          "UTC",
      },

      database: {
        filename:
          databaseBackup
            .filename,

        size:
          databaseBackup
            .size,

        checksum:
          databaseBackup
            .checksum,
      },

      media: {
        folder:
          mediaBackup
            .folderName,

        images:
          mediaBackup
            .images,

        videos:
          mediaBackup
            .videos,

        total:
          mediaBackup
            .total,
      },

      retention: {
        limit:
          config.retention,

        deleted:
          deleted.length,
      },
    });
  } catch (error) {
    console.error(
      "AUTOMATIC BACKUP ERROR:",
      error
    );

    return NextResponse.json(
      {
        success:
          false,

        message:
          "Automatic backup failed.",
      },
      {
        status:
          500,
      }
    );
  }
}