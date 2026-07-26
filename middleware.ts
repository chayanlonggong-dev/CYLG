import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  firewall,
} from "@/lib/security/firewall";

export function middleware(
  request: NextRequest
) {
  // 1. Firewall 檢查（完全保留原本邏輯）
  const result = firewall(request);

  if (!result.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: result.message,
      },
      {
        status: result.status,
      }
    );
  }

  const pathname = request.nextUrl.pathname;

  // 2. 保護後台頁面（完全保留原本邏輯）
  const isAdminPage =
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login");

  if (isAdminPage) {
    const session = request.cookies.get(
      "cylg_admin_session"
    );

    if (!session || !session.value) {
      return NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
    }

    // 注意：
    // 完整的 Session 過期 / 活動時間驗證
    // 會在後續 Session Manager + Layout 中做
    // （因為 middleware 跑在 Edge，不能直接用 Prisma）
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",
  ],
};