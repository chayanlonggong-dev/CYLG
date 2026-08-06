import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function POST() {
  try {
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
      exportedAt: new Date().toISOString(),

      version: "1.0.0",

      application: "ChaYanLongGong",

      database: "PostgreSQL",

      schema: "public",

      data: {
        models,
        websiteSettings,
        adminUsers,
        sessions,
        auditLogs,
        analytics,
      },
    };

    // backup/database/
    const backupDir = path.join(
      process.cwd(),
      "backup",
      "database"
    );

    fs.mkdirSync(backupDir, {
      recursive: true,
    });

    const fileName =
      `CYLG-DB-${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.json`;

    const filePath = path.join(
      backupDir,
      fileName
    );

    const json = JSON.stringify(
      backup,
      null,
      2
    );

    fs.writeFileSync(
      filePath,
      json,
      "utf8"
    );

    const stat = fs.statSync(filePath);

    const checksum = crypto
      .createHash("sha256")
      .update(json)
      .digest("hex");

    await prisma.backupRecord.create({
      data: {
        filename: fileName,

        type: "Database",

        size: Math.round(stat.size / 1024),

        filePath,

        checksum,

        status: "Completed",
      },
    });

    return NextResponse.json({
      success: true,

      message:
        "Database backup saved successfully.",

      filename: fileName,

      checksum,

      size: Math.round(stat.size / 1024),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to save database backup.",
      },
      {
        status: 500,
      }
    );
  }
}