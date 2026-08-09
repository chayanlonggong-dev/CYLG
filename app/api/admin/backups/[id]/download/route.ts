import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import fs from "fs";
import path from "path";

import { getAdminSession } from "@/lib/auth/session";
import { apiUnauthorized } from "@/lib/api/response";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return apiUnauthorized(
        "Unauthorized.",
        "UNAUTHORIZED"
      );
    }

    const { id } = await params;

    const backup =
      await prisma.backupRecord.findUnique({
        where: {
          id,
        },
      });

    if (!backup) {
      return NextResponse.json(
        {
          success: false,
          message: "Backup record not found.",
        },
        {
          status: 404,
        }
      );
    }

    const filePath = path.join(
      process.cwd(),
      "backup",
      "database",
      backup.filename
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        {
          success: false,
          message: "Backup file not found.",
        },
        {
          status: 404,
        }
      );
    }

    const file = fs.readFileSync(filePath);

    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${backup.filename}"`,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to download backup.",
      },
      {
        status: 500,
      }
    );
  }
}