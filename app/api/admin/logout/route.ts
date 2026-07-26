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
    // 取得目前的 session token
    const token =
      request.cookies.get("cylg_admin_session")?.value;

    // 如果有 token，就從資料庫刪除對應 Session
    if (token) {
      await prisma.session.deleteMany({
        where: {
          token,
        },
      });
    }

    const response = NextResponse.json(
      {
        message: "Logout successful.",
      },
      {
        status: 200,
      }
    );

    // 清除 Cookie
    response.cookies.delete("cylg_admin_session");

    return response;
  } catch (error) {
    console.error("Admin logout error:", error);

    // 即使出錯也強制清除 Cookie，確保使用者能登出
    const response = NextResponse.json(
      {
        message: "Logout successful.",
      },
      {
        status: 200,
      }
    );

    response.cookies.delete("cylg_admin_session");

    return response;
  }
}