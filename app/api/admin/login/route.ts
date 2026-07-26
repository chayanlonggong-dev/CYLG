import {
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/lib/prisma";

import {
  verifyPassword,
} from "@/lib/auth/password";

import {
  randomBytes,
} from "crypto";

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const username = body.username;
    const password = body.password;

    if (!username || !password) {
      return NextResponse.json(
        {
          message: "Username and password are required.",
        },
        {
          status: 400,
        }
      );
    }

    const adminUser = await prisma.adminUser.findUnique({
      where: {
        username,
      },
    });

    if (!adminUser) {
      return NextResponse.json(
        {
          message: "Invalid username or password.",
        },
        {
          status: 401,
        }
      );
    }

    const valid = verifyPassword(
      password,
      adminUser.password
    );

    if (!valid) {
      return NextResponse.json(
        {
          message: "Invalid username or password.",
        },
        {
          status: 401,
        }
      );
    }

    // ===== Enterprise Session 開始 =====
    // 產生安全 token
    const token = randomBytes(32).toString("hex");

    // Session 預設 7 天（實際會用 lastActivityAt 做 30 分鐘無操作自動登出）
    const expiresAt = new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 7
    );

    // 取得 IP 與 User-Agent（之後 Device Manager 會用到）
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const userAgent =
      request.headers.get("user-agent") || "unknown";

    // 寫入 Session 到資料庫
    await prisma.session.create({
      data: {
        token,
        adminUserId: adminUser.id,
        expiresAt,
        lastActivityAt: new Date(),
        ip,
        userAgent,
      },
    });
    // ===== Enterprise Session 結束 =====

    const response = NextResponse.json(
      {
        message: "Login successful.",
      },
      {
        status: 200,
      }
    );

    // 設定 HttpOnly Cookie（改成存 token，不再直接存 user id）
    response.cookies.set(
      "cylg_admin_session",
      token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      }
    );

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      {
        message: "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}