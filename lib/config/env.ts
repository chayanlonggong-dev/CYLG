const nodeEnv =
  process.env.NODE_ENV ?? "development";

export const env = {
  NODE_ENV: nodeEnv,

  isDevelopment:
    nodeEnv === "development",

  isProduction:
    nodeEnv === "production",


  DATABASE_URL:
    process.env.DATABASE_URL ?? "",


  NEXT_PUBLIC_SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000",


  ENCRYPTION_KEY:
    process.env.ENCRYPTION_KEY ??
    "",


  SESSION_SECRET:
    process.env.SESSION_SECRET ??
    "",


  STORAGE_PROVIDER:
    process.env.STORAGE_PROVIDER ??
    "LOCAL",


  STORAGE_BUCKET:
    process.env.STORAGE_BUCKET ??
    "",


  STORAGE_ENDPOINT:
    process.env.STORAGE_ENDPOINT ??
    "",


  STORAGE_REGION:
    process.env.STORAGE_REGION ??
    "",


  REDIS_URL:
    process.env.REDIS_URL ??
    "",


  SMTP_HOST:
    process.env.SMTP_HOST ??
    "",


  SMTP_PORT:
    Number(
      process.env.SMTP_PORT ?? 587
    ),


  SMTP_USER:
    process.env.SMTP_USER ??
    "",


  SMTP_PASSWORD:
    process.env.SMTP_PASSWORD ??
    "",


  ADMIN_EMAIL:
    process.env.ADMIN_EMAIL ??
    "",


  WHATSAPP:
    process.env.WHATSAPP ??
    "",


  TELEGRAM:
    process.env.TELEGRAM ??
    "",


  SIGNAL:
    process.env.SIGNAL ??
    "",


  LINE:
    process.env.LINE ??
    "",


  WECHAT:
    process.env.WECHAT ??
    "",
};


export function validateEnv() {
  const required = [
    "DATABASE_URL",
    "SESSION_SECRET",
    "ENCRYPTION_KEY",
  ];

  const missing =
    required.filter(
      (key) =>
        !process.env[key]
    );

  return {
    valid:
      missing.length === 0,

    missing,
  };
}