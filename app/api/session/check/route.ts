import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/lib/prisma";

const SESSION_TIMEOUT = 10 * 60 * 1000;

export async function GET(
  request: NextRequest
) {
  try {
    const token =
      request.cookies.get("cylg_admin_session")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          expired: true,
        },
        {
          status: 401,
        }
      );
    }

    const session =
      await prisma.session.findUnique({
        where: {
          token,
        },
      });

    if (!session) {
      const response = NextResponse.json(
        {
          success: false,
          expired: true,
        },
        {
          status: 401,
        }
      );

      response.cookies.delete("cylg_admin_session");

      return response;
    }

    const now = Date.now();

    const lastActivity =
      new Date(
        session.lastActivityAt
      ).getTime();

    if (
      now - lastActivity >
      SESSION_TIMEOUT
    ) {
      await prisma.session.delete({
        where: {
          token,
        },
      });

      const response = NextResponse.json(
        {
          success: false,
          expired: true,
        },
        {
          status: 401,
        }
      );

      response.cookies.delete(
        "cylg_admin_session"
      );

      return response;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Session check error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}