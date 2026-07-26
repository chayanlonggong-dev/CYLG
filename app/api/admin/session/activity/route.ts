import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/lib/prisma";

export async function POST(
  request: NextRequest
) {
  try {
    const token =
      request.cookies.get("cylg_admin_session")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "No session.",
        },
        {
          status: 401,
        }
      );
    }

    // 更新 lastActivityAt，並確認 Session 仍然有效
    const session = await prisma.session.updateMany({
      where: {
        token,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        lastActivityAt: new Date(),
      },
    });

    if (session.count === 0) {
      // Session 不存在或已過期
      const response = NextResponse.json(
        {
          success: false,
          message: "Session expired.",
        },
        {
          status: 401,
        }
      );

      response.cookies.delete("cylg_admin_session");

      return response;
    }

    return NextResponse.json({
      success: true,
      message: "Activity updated.",
    });
  } catch (error) {
    console.error("Session activity error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}