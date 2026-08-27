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
  lastRunAt: Date | null;
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
      lastRunAt: created.lastRunAt ?? null,
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
    lastRunAt: scheduler.lastRunAt ?? null,
  };
}

/**
 * Get current Malaysia time day name.
 */
function getCurrentDayName(): string {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      weekday: "long",
      timeZone: "Asia/Kuala_Lumpur",
    }
  ).format(new Date());
}

/**
 * Get current Malaysia time.
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
        timeZone: "Asia/Kuala_Lumpur",
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
 * Get current Malaysia calendar date key: YYYY-MM-DD
 */
function getCurrentMalaysiaDateKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Convert a Date to Malaysia calendar date key.
 */
function toMalaysiaDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Extract HH from "HH:mm".
 */
function getHourFromTime(time: string): string {
  const hour = (time || "00:00").split(":")[0] ?? "00";
  return hour === "24" ? "00" : hour.padStart(2, "0");
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
     * 4. Get current Malaysia
     *    schedule.
     */
    const currentDay =
      getCurrentDayName();

    const currentTime =
      getCurrentTime();

    const currentDateKey =
      getCurrentMalaysiaDateKey();

    /**
     * 5. Check if today matches the configured day.
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

        message:
          `Today is ${currentDay}, scheduled day is ${config.day}.`,

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

        current: {
          day:
            currentDay,

          time:
            currentTime,

          dateKey:
            currentDateKey,
        },
      });
    }

    /**
     * 6. Check if current hour matches the scheduled hour.
     *    (Vercel Cron usually triggers once per hour)
     */
    const scheduledHour =
      getHourFromTime(
        config.time
      );

    const currentHour =
      getHourFromTime(
        currentTime
      );

    if (
      currentHour !==
      scheduledHour
    ) {
      return NextResponse.json({
        success:
          true,

        skipped:
          true,

        message:
          `Current hour is ${currentHour}, scheduled hour is ${scheduledHour}.`,

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

        current: {
          day:
            currentDay,

          time:
            currentTime,

          dateKey:
            currentDateKey,
        },
      });
    }

    /**
     * 7. Prevent running more than once on the same Malaysia calendar day.
     */
    if (
      config.lastRunAt
    ) {
      const lastRunDateKey =
        toMalaysiaDateKey(
          config.lastRunAt
        );

      if (
        lastRunDateKey ===
        currentDateKey
      ) {
        return NextResponse.json({
          success:
            true,

          skipped:
            true,

          message:
            "Backup already ran today (Malaysia time).",

          scheduler: {
            enabled:
              config.enabled,

            day:
              config.day,

            time:
              config.time,

            retention:
              config.retention,

            lastRunAt:
              config.lastRunAt,
          },

          current: {
            day:
              currentDay,

            time:
              currentTime,

            dateKey:
              currentDateKey,
          },
        });
      }
    }

    /**
     * 8. Execute backups.
     */
    const databaseBackup =
      await createDatabaseBackup();

    const mediaBackup =
      await createMediaBackup();

    /**
     * 9. Apply retention policy.
     */
    const deletedIds =
      await applyRetention(
        config.retention
      );

    /**
     * 10. Update lastRunAt.
     */
    const now =
      new Date();

    await prisma.backupScheduler.update({
      where: {
        id: 1,
      },
      data: {
        lastRunAt:
          now,
      },
    });

    /**
     * 11. Audit log.
     */
    try {
      await createAuditLog({
        action: "SETTINGS_CHANGE",

        description:
          "Scheduled automatic backup completed successfully.",

        entity:
          "BackupScheduler",

        entityId:
          1,

        metadata: {
          databaseFilename:
            databaseBackup.filename,

          mediaFolder:
            mediaBackup.folderName,

          images:
            mediaBackup.images,

          videos:
            mediaBackup.videos,

          retention:
            config.retention,

          deletedCount:
            deletedIds.length,

          deletedIds,
        },
      });
    } catch (auditError) {
      console.error(
        "AUDIT LOG ERROR:",
        auditError
      );
    }

    /**
     * 12. Success response.
     */
    return NextResponse.json({
      success:
        true,

      message:
        "Scheduled backup completed successfully.",

      database: {
        filename:
          databaseBackup.filename,

        size:
          databaseBackup.size,

        checksum:
          databaseBackup.checksum,
      },

      media: {
        folderName:
          mediaBackup.folderName,

        images:
          mediaBackup.images,

        videos:
          mediaBackup.videos,

        total:
          mediaBackup.total,
      },

      retention: {
        kept:
          config.retention,

        deleted:
          deletedIds.length,
      },

      scheduler: {
        enabled:
          config.enabled,

        day:
          config.day,

        time:
          config.time,

        retention:
          config.retention,

        lastRunAt:
          now,
      },

      current: {
        day:
          currentDay,

        time:
          currentTime,

        dateKey:
          currentDateKey,
      },
    });
  } catch (error) {
    console.error(
      "CRON BACKUP ERROR:",
      error
    );

    return NextResponse.json(
      {
        success:
          false,

        message:
          error instanceof Error
            ? error.message
            : "Unknown error during scheduled backup.",
      },
      {
        status:
          500,
      }
    );
  }
}