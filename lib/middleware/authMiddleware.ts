import { NextRequest } from "next/server";

import {
  getSession,
} from "@/lib/security/session";

export function getSessionFromRequest(
  request: NextRequest
) {
  const sessionId =
    request.cookies.get(
      "cylg_session"
    )?.value;

  if (!sessionId) {
    return null;
  }

  return getSession(sessionId);
}

export function isAuthenticated(
  request: NextRequest
) {
  const session =
    getSessionFromRequest(request);

  return Boolean(session);
}

export function requireAuth(
  request: NextRequest
) {
  const session =
    getSessionFromRequest(request);

  if (!session) {
    return {
      authenticated: false,
      session: null,
    };
  }

  return {
    authenticated: true,
    session,
  };
}