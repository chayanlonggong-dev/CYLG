export interface AdminSession {
  id: string;
  username: string;
  ip: string;
  userAgent: string;
  createdAt: Date;
  expiresAt: Date;
}

const sessions = new Map<string, AdminSession>();

const SESSION_DURATION = 24 * 60 * 60 * 1000;

function generateSessionId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 12)
  );
}

export function createSession(
  username: string,
  ip: string,
  userAgent: string
): AdminSession {
  const session: AdminSession = {
    id: generateSessionId(),
    username,
    ip,
    userAgent,
    createdAt: new Date(),
    expiresAt: new Date(
      Date.now() + SESSION_DURATION
    ),
  };

  sessions.set(session.id, session);

  return session;
}

export function getSession(
  sessionId: string
): AdminSession | null {
  const session = sessions.get(sessionId);

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    sessions.delete(sessionId);
    return null;
  }

  return session;
}

export function deleteSession(
  sessionId: string
) {
  sessions.delete(sessionId);
}

export function clearSessions() {
  sessions.clear();
}

export function getAllSessions() {
  return Array.from(sessions.values());
}

export function refreshSession(
  sessionId: string
): AdminSession | null {
  const session = getSession(sessionId);

  if (!session) {
    return null;
  }

  session.expiresAt = new Date(
    Date.now() + SESSION_DURATION
  );

  sessions.set(sessionId, session);

  return session;
}