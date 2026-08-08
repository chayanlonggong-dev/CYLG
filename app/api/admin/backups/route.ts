import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth/session";
import { createAuditLog } from "@/lib/audit/audit";

export async function GET() {
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

    const backups = await prisma.backupRecord.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: backups,
    });
  } catch (error) {
    console.error("GET BACKUPS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load backups.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
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

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON body.",
        },
        {
          status: 400,
        }
      );
    }

    const filename =
      typeof body.filename === "string"
        ? body.filename.trim()
        : "";

    const type =
      typeof body.type === "string"
        ? body.type.trim()
        : "";

    const size =
      typeof body.size === "number" &&
      Number.isFinite(body.size) &&
      body.size >= 0
        ? Math.round(body.size)
        : 0;

    const filePath =
      typeof body.filePath === "string"
        ? body.filePath.trim()
        : "";

    const checksum =
      typeof body.checksum === "string"
        ? body.checksum.trim()
        : "";

    if (!filename) {
      return NextResponse.json(
        {
          success: false,
          message: "Backup filename is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!type) {
      return NextResponse.json(
        {
          success: false,
          message: "Backup type is required.",
        },
        {
          status: 400,
        }
      );
    }

    const allowedTypes = [
      "Database",
      "Media",
    ];

    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported backup type.",
        },
        {
          status: 400,
        }
      );
    }

    const backup = await prisma.backupRecord.create({
      data: {
        filename,
        type,
        size,
        filePath,
        checksum,
        status: "Completed",
      },
    });

    await createAuditLog({
      action: "CREATE",
      entity: "BackupRecord",
      entityId: backup.id,
      userId: String(session.adminUserId),
      description: `Backup history record created: ${filename}.`,
      metadata: {
        backupType: type,
        filename,
        size,
        operator: session.username,
        result: "Success",
        actionLabel: "CREATE_BACKUP_RECORD",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: backup,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("POST BACKUPS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create backup.",
      },
      {
        status: 500,
      }
    );
  }
}