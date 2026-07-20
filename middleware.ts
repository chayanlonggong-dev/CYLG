import { NextRequest, NextResponse } from "next/server";
import { firewall } from "@/lib/security/firewall";

export function middleware(request: NextRequest) {
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",
  ],
};