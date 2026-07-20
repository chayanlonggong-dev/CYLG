import { createHash, timingSafeEqual } from "crypto";

const ALGORITHM = "sha256";

function hash(value: string) {
  return createHash(ALGORITHM)
    .update(value)
    .digest("hex");
}

export function hashPassword(password: string) {
  return hash(password);
}

export function verifyPassword(
  password: string,
  hashedPassword: string
) {
  const passwordHash = Buffer.from(
    hash(password),
    "utf8"
  );

  const storedHash = Buffer.from(
    hashedPassword,
    "utf8"
  );

  if (passwordHash.length !== storedHash.length) {
    return false;
  }

  return timingSafeEqual(
    passwordHash,
    storedHash
  );
}

export function isStrongPassword(
  password: string
) {
  if (password.length < 12) {
    return false;
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol =
    /[^A-Za-z0-9]/.test(password);

  return (
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSymbol
  );
}