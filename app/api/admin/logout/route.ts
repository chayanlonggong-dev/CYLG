import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit/audit";
import { apiMethodNotAllowed } from "@/lib/api/response";
import { clearCsrfCookie } from "@/lib/security/csrf";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("cylg_admin_session")?.value;
    let session = null;

    if (token) {
      session = await prisma.session.findUnique({
        where: { token },
        include: { adminUser: true },
      });

      await prisma.session.deleteMany({ where: { token } });
    }

    if (session) {
      createAuditLog({
        action: "LOGOUT",
        entity: "AdminUser",
        entityId: session.adminUserId,
        userId: String(session.adminUserId),
        description: "Admin logout successful.",
        metadata: {
          ip: session.ip,
          userAgent: session.userAgent,
        },
      });
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "Logout successful.",
      },
      { status: 200 }
    );

    response.cookies.delete("cylg_admin_session");
    clearCsrfCookie(response);

    return response;
  } catch (error) {
    console.error("Admin logout error:", error);

    const response = NextResponse.json(
      {
        success: true,
        message: "Logout successful.",
      },
      { status: 200 }
    );

    response.cookies.delete("cylg_admin_session");
    clearCsrfCookie(response);

    return response;
  }
}

export async function OPTIONS() {
  return apiMethodNotAllowed(
    "Method not allowed for this route.",
    "METHOD_NOT_ALLOWED"
  );
}