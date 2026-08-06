import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

function copyMedia(source: string, destination: string) {
  if (!fs.existsSync(source)) return;

  fs.mkdirSync(destination, { recursive: true });

  const files = fs.readdirSync(source);

  for (const file of files) {
    const sourcePath = path.join(source, file);
    const destinationPath = path.join(destination, file);

    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      copyMedia(sourcePath, destinationPath);
    } else {
      const ext = path.extname(file).toLowerCase();

      if (
        imageExtensions.includes(ext) ||
        videoExtensions.includes(ext)
      ) {
        fs.copyFileSync(sourcePath, destinationPath);
      }
    }
  }
}

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), "public");

    const backupRoot = path.join(
      process.cwd(),
      "backup",
      "media"
    );

    fs.mkdirSync(backupRoot, {
      recursive: true,
    });

    const now = new Date();

    const folderName =
      `${now.getFullYear()}-${
        String(now.getMonth() + 1).padStart(2, "0")
      }-${
        String(now.getDate()).padStart(2, "0")
      }-${
        String(now.getHours()).padStart(2, "0")
      }${
        String(now.getMinutes()).padStart(2, "0")
      }${
        String(now.getSeconds()).padStart(2, "0")
      }`;

    const backupFolder = path.join(
      backupRoot,
      folderName
    );

    copyMedia(publicDir, backupFolder);

    let images = 0;
    let videos = 0;

    function count(dir: string) {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const full = path.join(dir, file);

        const stat = fs.statSync(full);

        if (stat.isDirectory()) {
          count(full);
        } else {
          const ext = path.extname(file).toLowerCase();

          if (imageExtensions.includes(ext)) {
            images++;
          }

          if (videoExtensions.includes(ext)) {
            videos++;
          }
        }
      }
    }

    count(backupFolder);

    return NextResponse.json({
      success: true,
      images,
      videos,
      total: images + videos,
      folder: folderName,
      message: "Media backup completed.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to backup media.",
      },
      {
        status: 500,
      }
    );
  }
}