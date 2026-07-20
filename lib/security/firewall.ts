import { NextRequest } from "next/server";

export interface FirewallResult {
  allowed: boolean;
  status: number;
  message?: string;
}

const ipBlacklist = new Set<string>();

const countryBlacklist = new Set<string>();

const rateLimitStore = new Map<
  string,
  {
    count: number;
    expires: number;
  }
>();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 120;

function getIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return (
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  const record = rateLimitStore.get(ip);

  if (!record || record.expires < now) {
    rateLimitStore.set(ip, {
      count: 1,
      expires: now + WINDOW_MS,
    });

    return true;
  }

  if (record.count >= MAX_REQUESTS) {
    return false;
  }

  record.count++;

  return true;
}

export function addBlockedIp(ip: string) {
  ipBlacklist.add(ip);
}

export function removeBlockedIp(ip: string) {
  ipBlacklist.delete(ip);
}

export function addBlockedCountry(country: string) {
  countryBlacklist.add(country.toUpperCase());
}

export function removeBlockedCountry(country: string) {
  countryBlacklist.delete(country.toUpperCase());
}

export function firewall(
  request: NextRequest
): FirewallResult {
  const ip = getIp(request);

  if (ipBlacklist.has(ip)) {
    return {
      allowed: false,
      status: 403,
      message: "IP blocked.",
    };
  }

  const country =
    request.headers
      .get("x-vercel-ip-country")
      ?.toUpperCase() || "";

  if (
    country &&
    countryBlacklist.has(country)
  ) {
    return {
      allowed: false,
      status: 403,
      message: "Country blocked.",
    };
  }

  if (!checkRateLimit(ip)) {
    return {
      allowed: false,
      status: 429,
      message: "Rate limit exceeded.",
    };
  }

  return {
    allowed: true,
    status: 200,
  };
}