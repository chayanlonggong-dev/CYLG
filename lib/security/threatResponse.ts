import { prisma } from "@/lib/prisma";

const THREAT_WINDOW_MS = 5 * 60 * 1000;

const AUTO_BLOCK_THRESHOLD = 3;

export interface AutoThreatResponseResult {
  blocked: boolean;
  reason?: string;
  count: number;
}

export async function evaluateAutomaticThreatResponse(
  ip: string
): Promise<AutoThreatResponseResult> {
  if (!ip || ip === "127.0.0.1") {
    return {
      blocked: false,
      count: 0,
    };
  }

  const since = new Date(
    Date.now() - THREAT_WINDOW_MS
  );

  const count =
    await prisma.securityEvent.count({
      where: {
        type: "RATE_LIMIT_EXCEEDED",
        ip,
        createdAt: {
          gte: since,
        },
      },
    });

  if (count < AUTO_BLOCK_THRESHOLD) {
    return {
      blocked: false,
      count,
    };
  }

  const existingBlock =
    await prisma.firewallBlock.findUnique({
      where: {
        value: ip,
      },
    });

  if (existingBlock?.enabled) {
    return {
      blocked: true,
      reason: "IP already automatically blocked.",
      count,
    };
  }

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

  await prisma.securityEvent.create({
    data: {
      type: "FIREWALL_BLOCKED",
      severity: "CRITICAL",
      status: "OPEN",
      ip,
      country: null,
      userAgent: null,
      adminUserId: null,
      description:
        "IP automatically blocked after repeated rate limit violations.",
      metadata: JSON.stringify({
        pathname: null,
        blockType: "IP",
        result: "AutoBlocked",
        actionLabel:
          "AUTOMATIC_THREAT_RESPONSE",
        trigger:
          "RATE_LIMIT_EXCEEDED",
        threshold:
          AUTO_BLOCK_THRESHOLD,
        windowMs:
          THREAT_WINDOW_MS,
        violationCount:
          count,
      }),
    },
  });

  return {
    blocked: true,
    reason:
      "IP automatically blocked after repeated rate limit violations.",
    count,
  };
}