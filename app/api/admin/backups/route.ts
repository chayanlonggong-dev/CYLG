import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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
    console.error(error);

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
    const body = await request.json();

    const backup = await prisma.backupRecord.create({
      data: {
        filename:
          body.filename ??
          `backup-${Date.now()}.json`,

        type:
          body.type ??
          "Database",

        size:
          body.size ??
          0,

        status:
          "Completed",
      },
    });

    return NextResponse.json({
      success: true,
      data: backup,
    });
  } catch (error) {
    console.error(error);

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