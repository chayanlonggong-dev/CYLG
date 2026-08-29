import { NextRequest } from "next/server";
import {
  getSessionByToken,
  getSessionWithUser,
} from "@/lib/security/session";

/**
 * 從 cookie 讀取並驗證 Admin session（查 Prisma）
 */
export async function getSessionFromRequest(
  request: NextRequest
) {
  const token =
    request.cookies.get("cylg_admin_session")?.value;

  if (!token) {
    return null;
  }

  return getSessionByToken(token);
}

/**
 * 取得 session + adminUser
 */
export async function getSessionWithUserFromRequest(
  request: NextRequest
) {
  const token =
    request.cookies.get("cylg_admin_session")?.value;

  if (!token) {
    return null;
  }

  return getSessionWithUser(token);
}

export async function isAuthenticated(
  request: NextRequest
): Promise<boolean> {
  const session = await getSessionFromRequest(request);
  return Boolean(session);
}

export async function requireAuth(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return {
      authenticated: false as const,
      session: null,
    };
  }

  return {
    authenticated: true as const,
    session,
  };
}