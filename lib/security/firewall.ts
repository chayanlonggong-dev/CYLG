import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

import {
  evaluateAutomaticThreatResponse,
} from "@/lib/security/threatResponse";

export interface FirewallResult {
  allowed: boolean;
  status: number;
  message?: string;
}

type FirewallBlockType =
  | "IP"
  | "COUNTRY";

type SecurityEventType =
  | "FIREWALL_BLOCKED"
  | "RATE_LIMIT_EXCEEDED";

type SecurityEventSeverity =
  | "HIGH";

interface FirewallCache {
  expires: number;
  ips: Set<string>;
  countries: Set<string>;
}

const WINDOW_MS = 60 * 1000;

// IP request limit
const MAX_REQUESTS = 300;

// Firewall database cache
const FIREWALL_CACHE_TTL =
  30 * 1000;

// =====================================================
// In-memory rate limit store
// =====================================================

const rateLimitStore = new Map<
  string,
  {
    count: number;
    expires: number;
  }
>();

// =====================================================
// Firewall cache
// =====================================================

let firewallCache:
  FirewallCache | null = null;

// =====================================================
// Security Event Helper
// =====================================================

async function createFirewallSecurityEvent(
  data: {
    type: SecurityEventType;
    severity: SecurityEventSeverity;
    ip: string;
    country?: string | null;
    userAgent?: string | null;
    description: string;
    metadata?: Record<string, unknown>;
  }
) {
  try {
    await prisma.securityEvent.create({
      data: {
        type: data.type,

        severity:
          data.severity,

        status: "OPEN",

        ip: data.ip,

        country:
          data.country ?? null,

        userAgent:
          data.userAgent ?? null,

        adminUserId: null,

        description:
          data.description,

        metadata:
          data.metadata
            ? JSON.stringify(
                data.metadata
              )
            : null,
      },
    });
  } catch (error) {
    /*
     * Security event recording must never
     * disable the firewall itself.
     */
    console.error(
      "FIREWALL SECURITY EVENT ERROR:",
      error
    );
  }
}

// =====================================================
// Get client IP
// =====================================================

function getIp(
  request: NextRequest
): string {
  const forwarded =
    request.headers.get(
      "x-forwarded-for"
    );

  if (forwarded) {
    return forwarded
      .split(",")[0]
      .trim();
  }

  return (
    request.headers.get(
      "x-real-ip"
    ) ||
    "127.0.0.1"
  );
}

// =====================================================
// Rate Limit
// =====================================================

function checkRateLimit(
  ip: string
): boolean {
  const now = Date.now();

  const record =
    rateLimitStore.get(ip);

  if (
    !record ||
    record.expires < now
  ) {
    rateLimitStore.set(
      ip,
      {
        count: 1,
        expires:
          now + WINDOW_MS,
      }
    );

    return true;
  }

  if (
    record.count >=
    MAX_REQUESTS
  ) {
    return false;
  }

  record.count++;

  return true;
}

// =====================================================
// Load Firewall Blocks
// =====================================================

async function loadFirewallBlocks(): Promise<FirewallCache> {
  const now = Date.now();

  if (
    firewallCache &&
    firewallCache.expires > now
  ) {
    return firewallCache;
  }

  const blocks =
    await prisma.firewallBlock.findMany({
      where: {
        enabled: true,
      },

      select: {
        type: true,
        value: true,
      },
    });

  const ips =
    new Set<string>();

  const countries =
    new Set<string>();

  for (const block of blocks) {
    if (
      block.type ===
      ("IP" as FirewallBlockType)
    ) {
      ips.add(block.value);
    }

    if (
      block.type ===
      ("COUNTRY" as FirewallBlockType)
    ) {
      countries.add(
        block.value.toUpperCase()
      );
    }
  }

  firewallCache = {
    expires:
      now +
      FIREWALL_CACHE_TTL,

    ips,

    countries,
  };

  return firewallCache;
}

// =====================================================
// Clear Firewall Cache
// =====================================================

export function clearFirewallCache() {
  firewallCache = null;
}

// =====================================================
// Firewall
// =====================================================

export async function firewall(
  request: NextRequest
): Promise<FirewallResult> {
  const ip =
    getIp(request);

  const userAgent =
    request.headers.get(
      "user-agent"
    ) || null;

  const country =
    request.headers
      .get(
        "x-vercel-ip-country"
      )
      ?.toUpperCase()
      .trim() || null;

  const pathname =
    request.nextUrl.pathname;

  // ---------------------------------------------------
  // Load database firewall rules FIRST
  // ---------------------------------------------------

  let cache:
    FirewallCache;

  try {
    cache =
      await loadFirewallBlocks();
  } catch (error) {
    console.error(
      "Firewall database error:",
      error
    );

    /*
     * Fail closed for firewall database
     * failures.
     *
     * This prevents the application from
     * silently ignoring security rules.
     */
    return {
      allowed: false,

      status: 503,

      message:
        "Firewall service unavailable.",
    };
  }

  // ---------------------------------------------------
  // IP Blacklist
  // ---------------------------------------------------

  if (
    cache.ips.has(ip)
  ) {
    await createFirewallSecurityEvent({
      type:
        "FIREWALL_BLOCKED",

      severity:
        "HIGH",

      ip,

      country,

      userAgent,

      description:
        "Request blocked by IP firewall rule.",

      metadata: {
        pathname,

        blockType:
          "IP",

        result:
          "Blocked",

        actionLabel:
          "FIREWALL_IP_BLOCKED",
      },
    });

    return {
      allowed: false,

      status: 403,

      message:
        "IP blocked.",
    };
  }

  // ---------------------------------------------------
  // Country Blacklist
  // ---------------------------------------------------

  if (
    country &&
    cache.countries.has(
      country
    )
  ) {
    await createFirewallSecurityEvent({
      type:
        "FIREWALL_BLOCKED",

      severity:
        "HIGH",

      ip,

      country,

      userAgent,

      description:
        "Request blocked by country firewall rule.",

      metadata: {
        pathname,

        blockType:
          "COUNTRY",

        result:
          "Blocked",

        actionLabel:
          "FIREWALL_COUNTRY_BLOCKED",
      },
    });

    return {
      allowed: false,

      status: 403,

      message:
        "Country blocked.",
    };
  }

  // ---------------------------------------------------
  // Rate Limit
  // ---------------------------------------------------

  if (!checkRateLimit(ip)) {
    await createFirewallSecurityEvent({
      type:
        "RATE_LIMIT_EXCEEDED",

      severity:
        "HIGH",

      ip,

      country,

      userAgent,

      description:
        "Firewall rate limit exceeded.",

      metadata: {
        pathname,

        result:
          "Blocked",

        actionLabel:
          "FIREWALL_RATE_LIMIT_EXCEEDED",
      },
    });

    // -------------------------------------------------
    // Automatic Threat Response
    // -------------------------------------------------

    try {
      const threatResponse =
        await evaluateAutomaticThreatResponse(
          ip
        );

      if (
        threatResponse.blocked
      ) {
        /*
         * The automatic response has created
         * or confirmed an IP firewall rule.
         *
         * Clear the in-memory cache so the
         * next request immediately sees the
         * new firewall rule.
         */
        clearFirewallCache();

        console.warn(
          "AUTOMATIC THREAT RESPONSE:",
          {
            ip,
            count:
              threatResponse.count,
            reason:
              threatResponse.reason,
          }
        );
      }
    } catch (error) {
      /*
       * Automatic threat response must never
       * disable the existing rate-limit
       * protection.
       */
      console.error(
        "AUTOMATIC THREAT RESPONSE ERROR:",
        error
      );
    }

    return {
      allowed: false,

      status: 429,

      message:
        "Rate limit exceeded.",
    };
  }

  // ---------------------------------------------------
  // Allowed
  // ---------------------------------------------------

  return {
    allowed: true,

    status: 200,
  };
}