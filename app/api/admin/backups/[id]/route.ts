import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth/session";
import { apiUnauthorized } from "@/lib/api/response";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return apiUnauthorized(
        "Unauthorized.",
        "UNAUTHORIZED"
      );
    }

    const { id } = await context.params;

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

    await prisma.backupRecord.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Backup deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete backup.",
      },
      {
        status: 500,
      }
    );
  }
}