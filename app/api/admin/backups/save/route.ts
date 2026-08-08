import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth/session";
import { createAuditLog } from "@/lib/audit/audit";

import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function POST() {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        {
          status: 401,
        }
      );
    }

    const [
      models,
      websiteSettings,
      adminUsers,
      auditLogs,
      analytics,
    ] = await Promise.all([
      prisma.model.findMany(),
      prisma.websiteSettings.findMany(),
      prisma.adminUser.findMany(),
      prisma.auditLog.findMany(),
      prisma.analyticsVisit.findMany(),
    ]);

    /*
     * Sessions are intentionally NOT included.
     *
     * Session tokens are active authentication credentials
     * and must never be stored inside a portable backup.
     *
     * After a restore, administrators must log in again.
     */

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
        auditLogs,
        analytics,
      },
    };

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

    const size = Math.max(
      1,
      Math.round(stat.size / 1024)
    );

    const backupRecord =
      await prisma.backupRecord.create({
        data: {
          filename: fileName,

          type: "Database",

          size,

          filePath,

          checksum,

          status: "Completed",
        },
      });

    await createAuditLog({
      action: "CREATE",
      entity: "BackupRecord",
      entityId: backupRecord.id,
      userId: String(session.adminUserId),
      description:
        "Database backup created successfully.",
      metadata: {
        filename: fileName,
        size,
        checksum,
        operator: session.username,
        result: "Success",
        actionLabel: "DATABASE_BACKUP",
      },
    });

    return NextResponse.json({
      success: true,

      message:
        "Database backup saved successfully.",

      filename: fileName,

      checksum,

      size,
    });
  } catch (error) {
    console.error(
      "DATABASE BACKUP ERROR:",
      error
    );

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