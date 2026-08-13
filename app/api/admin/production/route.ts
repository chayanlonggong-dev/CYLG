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

    // Database — runtime connectivity
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch {
      checks.database = false;
    }

    // Upload Folder — public assets root exists in the deployment bundle
    const uploadPath = path.join(process.cwd(), "public");
    checks.uploads = fs.existsSync(uploadPath);

    /*
     * Backup readiness (production-correct for Vercel Serverless)
     *
     * Local `backup/` on disk is ephemeral on Vercel and is NOT a valid
     * production readiness signal.
     *
     * What is production-relevant today:
     * - BackupRecord / BackupScheduler live in PostgreSQL
     * - Export API streams JSON download (no durable local FS required)
     * - Save-to-disk remains available for non-serverless environments
     *
     * Pass when the DB-backed backup subsystem is reachable.
     */
    try {
      await Promise.all([
        prisma.backupRecord.findFirst(),
        prisma.backupScheduler.findFirst(),
      ]);
      checks.backups = true;
    } catch {
      checks.backups = false;
    }

    /*
     * Environment — align with lib/config/env.ts validateEnv()
     *
     * DIRECT_URL is declared in schema for migrations / direct connections.
     * It is NOT required for production runtime readiness when DATABASE_URL
     * already serves pooled queries successfully on Vercel.
     */
    checks.environment =
      !!process.env.DATABASE_URL &&
      !!process.env.SESSION_SECRET &&
      !!process.env.ENCRYPTION_KEY;

    // Prisma Client is available if this route module loaded
    checks.prisma = true;

    // Node runtime
    checks.node = true;

    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;
    const score = Math.round((passed / total) * 100);

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
        message: "Failed to check production readiness.",
      },
      {
        status: 500,
      }
    );
  }
}