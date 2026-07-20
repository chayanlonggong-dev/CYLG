import crypto from "crypto";

const SALT_LENGTH = 16;

const KEY_LENGTH = 64;

const ITERATIONS = 100000;

const DIGEST = "sha512";


export function hashPassword(
  password: string
) {
  const salt =
    crypto
      .randomBytes(SALT_LENGTH)
      .toString("hex");

  const hash =
    crypto
      .pbkdf2Sync(
        password,
        salt,
        ITERATIONS,
        KEY_LENGTH,
        DIGEST
      )
      .toString("hex");

  return `${salt}:${hash}`;
}


export function verifyPassword(
  password: string,
  storedPassword: string
) {
  const [
    salt,
    originalHash,
  ] =
    storedPassword.split(":");

  if (!salt || !originalHash) {
    return false;
  }

  const hash =
    crypto
      .pbkdf2Sync(
        password,
        salt,
        ITERATIONS,
        KEY_LENGTH,
        DIGEST
      )
      .toString("hex");

  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(originalHash)
  );
}


export function generatePasswordResetToken() {
  return crypto
    .randomBytes(32)
    .toString("hex");
}


export function validatePasswordStrength(
  password: string
) {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push(
      "Password must contain at least 8 characters."
    );
  }

  if (!/[A-Z]/.test(password)) {
    errors.push(
      "Password must contain an uppercase letter."
    );
  }

  if (!/[a-z]/.test(password)) {
    errors.push(
      "Password must contain a lowercase letter."
    );
  }

  if (!/[0-9]/.test(password)) {
    errors.push(
      "Password must contain a number."
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}