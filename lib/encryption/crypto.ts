import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";

function getSecretKey() {
  const secret =
    process.env.ENCRYPTION_KEY ??
    "cylg-development-secret-key";

  return crypto
    .createHash("sha256")
    .update(secret)
    .digest();
}

export function encrypt(
  text: string
) {
  const iv =
    crypto.randomBytes(16);

  const cipher =
    crypto.createCipheriv(
      ALGORITHM,
      getSecretKey(),
      iv
    );

  const encrypted =
    Buffer.concat([
      cipher.update(text, "utf8"),
      cipher.final(),
    ]);

  return [
    iv.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

export function decrypt(
  encryptedText: string
) {
  const [
    ivHex,
    dataHex,
  ] =
    encryptedText.split(":");

  if (!ivHex || !dataHex) {
    throw new Error(
      "Invalid encrypted data."
    );
  }

  const decipher =
    crypto.createDecipheriv(
      ALGORITHM,
      getSecretKey(),
      Buffer.from(
        ivHex,
        "hex"
      )
    );

  const decrypted =
    Buffer.concat([
      decipher.update(
        Buffer.from(
          dataHex,
          "hex"
        )
      ),
      decipher.final(),
    ]);

  return decrypted.toString(
    "utf8"
  );
}

export function hash(
  value: string
) {
  return crypto
    .createHash("sha256")
    .update(value)
    .digest("hex");
}

export function compareHash(
  value: string,
  hashedValue: string
) {
  return (
    hash(value) === hashedValue
  );
}

export function generateRandomToken(
  length = 32
) {
  return crypto
    .randomBytes(length)
    .toString("hex");
}