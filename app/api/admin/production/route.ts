import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const checks = {
      database: false,
      uploads: false,
      backups: false,
      environment: false,
      prisma: false,
      node: false,
    };

    // Database
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch {}

    // Upload Folder
    const uploadPath = path.join(
      process.cwd(),
      "public"
    );

    checks.uploads = fs.existsSync(uploadPath);

    // Backup Folder
    const backupPath = path.join(
      process.cwd(),
      "backup"
    );

    checks.backups = fs.existsSync(backupPath);

    // Environment
    checks.environment =
      !!process.env.DATABASE_URL &&
      !!process.env.DIRECT_URL;

    // Prisma
    checks.prisma = true;

    // Node
    checks.node = true;

    const passed =
      Object.values(checks).filter(Boolean).length;

    const total =
      Object.keys(checks).length;

    const score = Math.round(
      (passed / total) * 100
    );

    return NextResponse.json({
      success: true,

      data: {
        checks,

        score,

        passed,

        total,

        ready:
          score === 100
            ? "Production Ready"
            : "Needs Attention",
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to check production readiness.",
      },
      {
        status: 500,
      }
    );
  }
}