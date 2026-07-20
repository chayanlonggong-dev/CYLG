import { randomBytes } from "crypto";

const CSRF_TOKEN_LENGTH = 32;

const tokens = new Map<string, string>();

export function generateCsrfToken(
  sessionId: string
) {
  const token = randomBytes(
    CSRF_TOKEN_LENGTH
  ).toString("hex");

  tokens.set(
    sessionId,
    token
  );

  return token;
}

export function getCsrfToken(
  sessionId: string
) {
  return (
    tokens.get(sessionId) ??
    null
  );
}

export function verifyCsrfToken(
  sessionId: string,
  token: string
) {
  const storedToken =
    tokens.get(sessionId);

  if (!storedToken) {
    return false;
  }

  return storedToken === token;
}

export function removeCsrfToken(
  sessionId: string
) {
  tokens.delete(sessionId);
}

export function clearCsrfTokens() {
  tokens.clear();
}