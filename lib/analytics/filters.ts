/**
 * Shared Analytics filtering & classification helpers.
 * All public dashboard metrics MUST go through these filters.
 */

export const BOT_UA_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /slurp/i,
  /googlebot/i,
  /bingbot/i,
  /yandex/i,
  /baiduspider/i,
  /duckduckbot/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /embedly/i,
  /quora link preview/i,
  /showyoubot/i,
  /outbrain/i,
  /pinterest/i,
  /applebot/i,
  /semrush/i,
  /ahrefs/i,
  /mj12bot/i,
  /dotbot/i,
  /petalbot/i,
  /bytespider/i,
  /headlesschrome/i,
  /phantomjs/i,
  /selenium/i,
  /puppeteer/i,
  /playwright/i,
  /wget/i,
  /curl\//i,
  /python-requests/i,
  /go-http-client/i,
  /java\//i,
  /scrapy/i,
  /httpclient/i,
  /libwww/i,
  /lighthouse/i,
  /chrome-lighthouse/i,
  /gtmetrix/i,
  /pingdom/i,
  /uptime/i,
  /monitor/i,
  /preview/i,
];

export function isBotUserAgent(ua: string | null | undefined): boolean {
  if (!ua || ua.trim() === "") return true;
  return BOT_UA_PATTERNS.some((re) => re.test(ua));
}

export function isAdminPath(path: string | null | undefined): boolean {
  if (!path) return false;
  const p = path.toLowerCase();
  return (
    p.startsWith("/admin") ||
    p.startsWith("/api/admin") ||
    p.startsWith("/_next") ||
    p === "/favicon.ico" ||
    p === "/robots.txt" ||
    p === "/sitemap.xml" ||
    p.startsWith("/sitemap") ||
    p.startsWith("/api/") ||
    p.endsWith(".js") ||
    p.endsWith(".css") ||
    p.endsWith(".map") ||
    p.endsWith(".woff") ||
    p.endsWith(".woff2") ||
    p.endsWith(".png") ||
    p.endsWith(".jpg") ||
    p.endsWith(".jpeg") ||
    p.endsWith(".gif") ||
    p.endsWith(".svg") ||
    p.endsWith(".ico") ||
    p.endsWith(".webp")
  );
}

export function isDevelopmentRecord(record: {
  country?: string | null;
  ip?: string | null;
}): boolean {
  const country = (record.country || "").toLowerCase();
  const ip = (record.ip || "").toLowerCase();
  if (
    country === "development" ||
    country === "local development" ||
    country === "localhost"
  ) {
    return true;
  }
  if (
    ip === "local" ||
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "localhost" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.")
  ) {
    return true;
  }
  return false;
}

export function isPublicRealHuman(record: {
  path?: string | null;
  userAgent?: string | null;
  country?: string | null;
  ip?: string | null;
}): boolean {
  if (isAdminPath(record.path)) return false;
  if (isDevelopmentRecord(record)) return false;
  if (isBotUserAgent(record.userAgent)) return false;
  return true;
}

export function isUnitedStates(country: string | null | undefined): boolean {
  if (!country) return false;
  const c = country.trim().toLowerCase();
  return c === "united states" || c === "us" || c === "usa";
}

export function isContactClickPath(path: string | null | undefined): boolean {
  if (!path) return false;
  return path.startsWith("/book/");
}

export function isModelPath(path: string | null | undefined): boolean {
  if (!path) return false;
  return (
    path.startsWith("/model/") ||
    path.startsWith("/models/") ||
    /^\/[a-z]+\/[A-Z0-9]+$/i.test(path)
  );
}

export function isCollectionPath(path: string | null | undefined): boolean {
  if (!path) return false;
  return path.startsWith("/collection/") || path.startsWith("/collections/");
}

export function extractModelCode(path: string): string | null {
  if (!path) return null;
  if (path.startsWith("/book/")) {
    const parts = path.split("/");
    return parts[3] || null;
  }
  const m = path.match(/\/models?\/([A-Za-z0-9_-]+)/i);
  if (m) return m[1];
  return null;
}

export function extractCollection(path: string): string | null {
  if (!path) return null;
  const m = path.match(/\/collections?\/([A-Za-z0-9_-]+)/i);
  if (m) return m[1].toUpperCase();
  const code = extractModelCode(path);
  if (code) {
    const prefix = code.replace(/[0-9].*$/, "").toUpperCase();
    if (prefix) return prefix;
  }
  return null;
}

export type TrafficQuality =
  | "real_human"
  | "bot"
  | "admin"
  | "development"
  | "suspicious";

export function classifyTrafficQuality(record: {
  path?: string | null;
  userAgent?: string | null;
  country?: string | null;
  ip?: string | null;
}): TrafficQuality {
  if (isDevelopmentRecord(record)) return "development";
  if (isAdminPath(record.path)) return "admin";
  if (isBotUserAgent(record.userAgent)) return "bot";
  if (!record.userAgent || record.userAgent.length < 10) return "suspicious";
  return "real_human";
}