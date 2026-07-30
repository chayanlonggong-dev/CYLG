import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/lib/prisma";

import {
  apiMethodNotAllowed,
  apiServerError,
  apiUnauthorized,
  apiSuccess,
} from "@/lib/api/response";

export async function POST(
  request: NextRequest
) {
  try {
    const token = request.cookies.get("cylg_admin_session")?.value;

    if (!token) {
      return apiUnauthorized("No session.", "NO_SESSION");
    }

    const session = await prisma.session.findUnique({ where: { token } });

    if (!session) {
      const response = apiUnauthorized("Session expired.", "SESSION_EXPIRED");
      response.cookies.delete("cylg_admin_session");
      return response;
    }

    if (session.expiresAt <= new Date()) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      const response = apiUnauthorized("Session expired.", "SESSION_EXPIRED");
      response.cookies.delete("cylg_admin_session");
      return response;
    }

    await prisma.session.update({ where: { id: session.id }, data: { lastActivityAt: new Date() } });

    return apiSuccess(null, "Activity updated.", 200);
  } catch (error) {
    console.error("Session activity error:", error);
    return apiServerError("Internal server error.", "SESSION_ACTIVITY_FAILED");
  }
}

export async function GET() {
  return apiMethodNotAllowed("Method not allowed for this route.", "METHOD_NOT_ALLOWED");
}

export async function DELETE() {
  return apiMethodNotAllowed("Method not allowed for this route.", "METHOD_NOT_ALLOWED");
}
