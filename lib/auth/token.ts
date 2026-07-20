import { randomBytes, createHash } from "crypto";

const TOKEN_LENGTH = 32;

export interface AuthToken {
  token: string;
  hash: string;
  createdAt: Date;
  expiresAt: Date;
}

const TOKEN_EXPIRES_MS = 24 * 60 * 60 * 1000;

export function generateToken(): AuthToken {
  const token = randomBytes(TOKEN_LENGTH).toString("hex");

  const hash = createHash("sha256")
    .update(token)
    .digest("hex");

  const createdAt = new Date();

  const expiresAt = new Date(
    createdAt.getTime() + TOKEN_EXPIRES_MS
  );

  return {
    token,
    hash,
    createdAt,
    expiresAt,
  };
}

export function hashToken(token: string): string {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

export function verifyToken(
  token: string,
  hash: string
): boolean {
  return hashToken(token) === hash;
}

export function isTokenExpired(
  expiresAt: Date
): boolean {
  return Date.now() >= expiresAt.getTime();
}