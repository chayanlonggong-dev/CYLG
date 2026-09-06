import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import fs from "fs";
import path from "path";

import { getAdminSession } from "@/lib/auth/session";
import { apiUnauthorized } from "@/lib/api/response";

export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session) {
      return apiUnauthorized(
        "Unauthorized.",
        "UNAUTHORIZED"
      );
    }

    const checks = {
      database: false,
      uploads: false,
      backups: false,
      environment: false,
      prisma: false,
      node: false,
    };

    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch {
      checks.database = false;
    }

    const uploadPath = path.join(
      /*turbopackIgnore: true*/ process.cwd(),
      "public"
    );
    checks.uploads = fs.existsSync(uploadPath);

    try {
      await Promise.all([
        prisma.backupRecord.findFirst(),
        prisma.backupScheduler.findFirst(),
      ]);
      checks.backups = true;
    } catch {
      checks.backups = false;
    }

    const requiredEnv = [
      "DATABASE_URL",
      "SESSION_SECRET",
      "ENCRYPTION_KEY",
    ] as const;

    const missingEnv = requiredEnv.filter(
      (key) => !process.env[key]?.trim()
    );

    checks.environment = missingEnv.length === 0;
    checks.prisma = true;
    checks.node = true;

    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;
    const score = Math.round((passed / total) * 100);

    return NextResponse.json({
      success: true,
      data: {
        checks,
        missingEnv,
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
        message: "Failed to check production readiness.",
      },
      {
        status: 500,
      }
    );
  }
}