import { prisma } from "@/lib/prisma";

import { clearFirewallCache } from "@/lib/security/firewall";

const THREAT_WINDOW_MS = 5 * 60 * 1000;

const AUTO_BLOCK_THRESHOLD = 3;

export interface SecurityRecoveryResult {
  blockedIps: string[];
  revokedSessions: number;
  skippedCurrentIp: boolean;
  threatCount: number;
}

function normalizeIp(
  ip: string | null | undefined
): string {
  return typeof ip === "string"
    ? ip.trim()
    : "";
}

export async function executeSecurityRecovery(
  adminUserId: number,
  currentSessionId: string,
  currentIp: string
): Promise<SecurityRecoveryResult> {
  const normalizedCurrentIp =
    normalizeIp(currentIp);

  const since = new Date(
    Date.now() - THREAT_WINDOW_MS
  );

  // =====================================================
  // Find recent security threats
  // =====================================================

  const recentThreats =
    await prisma.securityEvent.findMany({
      where: {
        createdAt: {
          gte: since,
        },

        type: {
          in: [
            "RATE_LIMIT_EXCEEDED",
            "FIREWALL_BLOCKED",
          ],
        },

        ip: {
          not: null,
        },
      },

      select: {
        ip: true,
      },
    });

  // =====================================================
  // Count threats per IP
  // =====================================================

  const threatCounts =
    new Map<string, number>();

  for (const threat of recentThreats) {
    const ip = normalizeIp(threat.ip);

    if (!ip) {
      continue;
    }

    const currentCount =
      threatCounts.get(ip) ?? 0;

    threatCounts.set(
      ip,
      currentCount + 1
    );
  }

  // =====================================================
  // Determine IPs requiring automatic blocking
  // =====================================================

  const candidateIps: string[] = [];

  for (const [ip, count] of threatCounts) {
    if (count < AUTO_BLOCK_THRESHOLD) {
      continue;
    }

    // Never automatically block the
    // administrator's current IP.
    if (
      normalizedCurrentIp &&
      ip === normalizedCurrentIp
    ) {
      continue;
    }

    candidateIps.push(ip);
  }

  // =====================================================
  // Create / enable firewall blocks
  // =====================================================

  const blockedIps: string[] = [];

  for (const ip of candidateIps) {
    await prisma.firewallBlock.upsert({
      where: {
        value: ip,
      },

      create: {
        type: "IP",
        value: ip,
        enabled: true,
      },

      update: {
        type: "IP",
        enabled: true,
      },
    });

    blockedIps.push(ip);
  }

  // =====================================================
  // Immediately invalidate firewall cache
  // =====================================================

  if (blockedIps.length > 0) {
    clearFirewallCache();
  }

  // =====================================================
  // Revoke all OTHER sessions belonging to
  // the current administrator.
  //
  // IMPORTANT:
  // We identify the current session by SESSION ID,
  // not by IP address.
  //
  // This prevents accidental deletion of the current
  // session when the request IP differs from the IP
  // stored in the session because of a proxy, CDN,
  // localhost, IPv4/IPv6 difference, etc.
  // =====================================================

  const sessionDeleteResult =
    await prisma.session.deleteMany({
      where: {
        adminUserId,

        NOT: {
          id: currentSessionId,
        },
      },
    });

  // =====================================================
  // Count total threats discovered
  // =====================================================

  const threatCount =
    Array.from(
      threatCounts.values()
    ).reduce(
      (total, count) =>
        total + count,
      0
    );

  return {
    blockedIps,

    revokedSessions:
      sessionDeleteResult.count,

    skippedCurrentIp:
      Boolean(
        normalizedCurrentIp &&
        threatCounts.has(
          normalizedCurrentIp
        )
      ),

    threatCount,
  };
}