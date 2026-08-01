import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  firewall,
} from "@/lib/security/firewall";

export function proxy(
  request: NextRequest
) {
  // Firewall
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

  // Protect Admin Pages
  const isAdminPage =
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login");

  if (isAdminPage) {
    const session =
      request.cookies.get("cylg_admin_session");

    if (!session?.value) {
      return NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",
  ],
};