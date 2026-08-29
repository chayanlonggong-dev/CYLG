import { NextRequest, NextResponse } from "next/server";
import { firewall } from "@/lib/security/firewall";
import { verifyCsrf } from "@/lib/security/csrf";
import { verifyAdminOrigin } from "@/lib/security/origin";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Firewall（Admin 頁 + API）
  const result = await firewall(request);

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

  // Admin 頁面保護（除 login）
  const isAdminPage =
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login");

  if (isAdminPage) {
    const session = request.cookies.get("cylg_admin_session");

    if (!session?.value) {
      return NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
    }
  }

  // Admin API：Origin + CSRF（login 除外）
  const isAdminApi =
  pathname.startsWith("/api/admin") &&
  !pathname.startsWith("/api/admin/login") &&
  pathname !== "/api/admin/backups/cron";

  if (isAdminApi) {
    if (!verifyAdminOrigin(request)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid origin.",
        },
        { status: 403 }
      );
    }

    if (!verifyCsrf(request)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid CSRF token.",
        },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};