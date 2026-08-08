import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

import { getAdminSession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rateLimit";
import { createAuditLog } from "@/lib/audit/audit";

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

function copyMedia(
  source: string,
  destination: string
) {
  if (!fs.existsSync(source)) {
    return;
  }

  fs.mkdirSync(destination, {
    recursive: true,
  });

  const files = fs.readdirSync(source);

  for (const file of files) {
    const sourcePath = path.join(
      source,
      file
    );

    const destinationPath = path.join(
      destination,
      file
    );

    const stat = fs.statSync(
      sourcePath
    );

    if (stat.isDirectory()) {
      copyMedia(
        sourcePath,
        destinationPath
      );
    } else {
      const ext = path
        .extname(file)
        .toLowerCase();

      if (
        imageExtensions.includes(ext) ||
        videoExtensions.includes(ext)
      ) {
        fs.copyFileSync(
          sourcePath,
          destinationPath
        );
      }
    }
  }
}

function countMedia(
  dir: string
) {
  let images = 0;
  let videos = 0;

  if (!fs.existsSync(dir)) {
    return {
      images,
      videos,
    };
  }

  const files =
    fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(
      dir,
      file
    );

    const stat =
      fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const nested =
        countMedia(fullPath);

      images += nested.images;
      videos += nested.videos;
    } else {
      const ext = path
        .extname(file)
        .toLowerCase();

      if (
        imageExtensions.includes(ext)
      ) {
        images++;
      }

      if (
        videoExtensions.includes(ext)
      ) {
        videos++;
      }
    }
  }

  return {
    images,
    videos,
  };
}

export async function GET() {
  try {
    /*
     * Admin authentication
     */
    const session =
      await getAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Authentication required.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * Rate limit
     *
     * Prevent repeated expensive filesystem
     * backup operations.
     */
    const limit = rateLimit(
      `admin-media-backup:${session.adminUserId}`,
      {
        limit: 10,
        windowMs:
          60 * 60 * 1000,
      }
    );

    if (!limit.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many backup requests. Please try again later.",
        },
        {
          status: 429,
        }
      );
    }

    /*
     * Source directory
     */
    const publicDir =
      path.join(
        process.cwd(),
        "public"
      );

    if (!fs.existsSync(publicDir)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Public media directory not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Backup root
     */
    const backupRoot =
      path.join(
        process.cwd(),
        "backup",
        "media"
      );

    fs.mkdirSync(
      backupRoot,
      {
        recursive: true,
      }
    );

    /*
     * Create unique backup folder
     */
    const now =
      new Date();

    const folderName =
      `${now.getFullYear()}-${
        String(
          now.getMonth() + 1
        ).padStart(2, "0")
      }-${
        String(
          now.getDate()
        ).padStart(2, "0")
      }-${
        String(
          now.getHours()
        ).padStart(2, "0")
      }${
        String(
          now.getMinutes()
        ).padStart(2, "0")
      }${
        String(
          now.getSeconds()
        ).padStart(2, "0")
      }`;

    const backupFolder =
      path.join(
        backupRoot,
        folderName
      );

    /*
     * Copy media
     */
    copyMedia(
      publicDir,
      backupFolder
    );

    /*
     * Count copied media
     */
    const {
      images,
      videos,
    } =
      countMedia(
        backupFolder
      );

    const total =
      images + videos;

    /*
     * Audit log
     */
    await createAuditLog({
      action: "CREATE",
      entity: "MediaBackup",
      entityId: folderName,
      userId: String(
        session.adminUserId
      ),
      description:
        "Media backup completed successfully.",
      metadata: {
        folder: folderName,
        images,
        videos,
        total,
        operator:
          session.username,
        result: "Success",
        actionLabel:
          "MEDIA_BACKUP",
      },
    });

    return NextResponse.json({
      success: true,
      images,
      videos,
      total,
      folder: folderName,
      message:
        "Media backup completed.",
    });
  } catch (error) {
    console.error(
      "MEDIA BACKUP ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to backup media.",
      },
      {
        status: 500,
      }
    );
  }
}