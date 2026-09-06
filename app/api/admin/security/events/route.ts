import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

import { getAdminSession } from "@/lib/auth/session";

import { rateLimit } from "@/lib/rateLimit";

import { createAuditLog } from "@/lib/audit/audit";

import {
  apiBadRequest,
  apiError,
  apiMethodNotAllowed,
  apiNotFound,
  apiServerError,
  apiSuccess,
  apiUnauthorized,
} from "@/lib/api/response";

import {
  isEmptyJsonBody,
  parseRequestJson,
} from "@/lib/api/request";

const SECURITY_EVENT_TYPES = [
  "LOGIN_FAILED",
  "ACCOUNT_LOCKED",
  "INVALID_2FA",
  "TWO_FACTOR_RATE_LIMITED",
  "FIREWALL_BLOCKED",
  "RATE_LIMIT_EXCEEDED",
  "SUSPICIOUS_SESSION",
  "UNAUTHORIZED_ACCESS",
  "SENSITIVE_ACTION",
] as const;

const SECURITY_EVENT_SEVERITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

const SECURITY_EVENT_STATUSES = [
  "OPEN",
  "ACKNOWLEDGED",
  "RESOLVED",
] as const;

type SecurityEventType =
  (typeof SECURITY_EVENT_TYPES)[number];

type SecurityEventSeverity =
  (typeof SECURITY_EVENT_SEVERITIES)[number];

type SecurityEventStatus =
  (typeof SECURITY_EVENT_STATUSES)[number];

function getClientIp(request: NextRequest): string {
  return (
    request.headers
      .get("x-forwarded-for")
      ?.split(",")[0]
      ?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isSecurityEventType(
  value: string
): value is SecurityEventType {
  return (
    SECURITY_EVENT_TYPES as readonly string[]
  ).includes(value);
}

function isSecurityEventSeverity(
  value: string
): value is SecurityEventSeverity {
  return (
    SECURITY_EVENT_SEVERITIES as readonly string[]
  ).includes(value);
}

function isSecurityEventStatus(
  value: string
): value is SecurityEventStatus {
  return (
    SECURITY_EVENT_STATUSES as readonly string[]
  ).includes(value);
}

function isLocalIp(ip: string | null | undefined): boolean {
  const v = (ip || "").trim().toLowerCase();
  return (
    !v ||
    v === "unknown" ||
    v === "::1" ||
    v === "127.0.0.1" ||
    v === "localhost" ||
    v === "local"
  );
}

function groupSecurityEvents<
  T extends { type: string; status: string; ip: string | null }
>(events: T[]) {
  const map = new Map<
    string,
    T & { count: number; isLocal: boolean; originLabel: string }
  >();

  for (const event of events) {
    const key = `${event.status}|${event.type}|${event.ip || "unknown"}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        ...event,
        count: 1,
        isLocal: isLocalIp(event.ip),
        originLabel: isLocalIp(event.ip) ? "Local machine" : "External",
      });
    } else {
      existing.count += 1;
    }
  }

  return Array.from(map.values());
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return apiUnauthorized(
        "Unauthorized.",
        "UNAUTHORIZED"
      );
    }

    const ip = getClientIp(request);

    const limit = rateLimit(
      `security-events-get:${ip}`,
      {
        limit: 60,
        windowMs: 60 * 1000,
      }
    );

    if (!limit.success) {
      return apiError(
        "Too many requests.",
        429,
        "RATE_LIMITED"
      );
    }

    const { searchParams } =
      new URL(request.url);

    const type =
      searchParams.get("type")?.trim() || "";

    const severity =
      searchParams
        .get("severity")
        ?.trim()
        .toUpperCase() || "";

    const status =
      searchParams
        .get("status")
        ?.trim()
        .toUpperCase() || "";

    const limitParam = Number(
      searchParams.get("limit") || "100"
    );

    const take = Math.min(
      Math.max(
        Number.isFinite(limitParam)
          ? Math.floor(limitParam)
          : 100,
        1
      ),
      500
    );

    if (
      type &&
      !isSecurityEventType(type)
    ) {
      return apiBadRequest(
        "Invalid security event type.",
        "INVALID_EVENT_TYPE"
      );
    }

    if (
      severity &&
      !isSecurityEventSeverity(severity)
    ) {
      return apiBadRequest(
        "Invalid security event severity.",
        "INVALID_EVENT_SEVERITY"
      );
    }

    if (
      status &&
      !isSecurityEventStatus(status)
    ) {
      return apiBadRequest(
        "Invalid security event status.",
        "INVALID_EVENT_STATUS"
      );
    }

    const events =
      await prisma.securityEvent.findMany({
        where: {
          ...(type
            ? {
                type:
                  type as SecurityEventType,
              }
            : {}),

          ...(severity
            ? {
                severity:
                  severity as SecurityEventSeverity,
              }
            : {}),

          ...(status
            ? {
                status:
                  status as SecurityEventStatus,
              }
            : {}),
        },

        orderBy: {
          createdAt: "desc",
        },

        take,
      });

    const grouped = groupSecurityEvents(events);

    return apiSuccess(
      {
        events: grouped,
        total: grouped.length,
        rawTotal: events.length,
      },
      "Security events retrieved successfully.",
      200
    );
  } catch (error) {
    console.error(
      "SECURITY EVENTS GET ERROR:",
      error
    );

    return apiServerError(
      "Failed to fetch security events.",
      "SECURITY_EVENTS_FETCH_FAILED"
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const session =
      await getAdminSession();

    if (!session) {
      return apiUnauthorized(
        "Unauthorized.",
        "UNAUTHORIZED"
      );
    }

    const ip = getClientIp(request);

    const limit = rateLimit(
      `security-events-post:${ip}`,
      {
        limit: 60,
        windowMs: 60 * 60 * 1000,
      }
    );

    if (!limit.success) {
      return apiError(
        "Too many requests.",
        429,
        "RATE_LIMITED"
      );
    }

    const {
      body,
      error,
    } =
      await parseRequestJson<
        Record<string, unknown>
      >(request);

    if (error === "INVALID_JSON") {
      return apiBadRequest(
        "Invalid JSON body.",
        "INVALID_JSON"
      );
    }

    if (
      !body ||
      isEmptyJsonBody(body)
    ) {
      return apiBadRequest(
        "Request body is required.",
        "EMPTY_BODY"
      );
    }

    const rawType =
      typeof body.type === "string"
        ? body.type.trim().toUpperCase()
        : "";

    const rawSeverity =
      typeof body.severity === "string"
        ? body.severity.trim().toUpperCase()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const eventIp =
      typeof body.ip === "string"
        ? body.ip.trim()
        : ip;

    const country =
      typeof body.country === "string"
        ? body.country.trim().toUpperCase()
        : null;

    const userAgent =
      typeof body.userAgent === "string"
        ? body.userAgent.trim()
        : null;

    const adminUserId =
      typeof body.adminUserId === "number"
        ? body.adminUserId
        : null;

    const metadata =
      body.metadata &&
      typeof body.metadata === "object"
        ? JSON.stringify(body.metadata)
        : null;

    if (!rawType) {
      return apiBadRequest(
        "Security event type is required.",
        "MISSING_EVENT_TYPE"
      );
    }

    if (!isSecurityEventType(rawType)) {
      return apiBadRequest(
        "Invalid security event type.",
        "INVALID_EVENT_TYPE"
      );
    }

    if (!rawSeverity) {
      return apiBadRequest(
        "Security event severity is required.",
        "MISSING_EVENT_SEVERITY"
      );
    }

    if (!isSecurityEventSeverity(rawSeverity)) {
      return apiBadRequest(
        "Invalid security event severity.",
        "INVALID_EVENT_SEVERITY"
      );
    }

    if (!description) {
      return apiBadRequest(
        "Security event description is required.",
        "MISSING_DESCRIPTION"
      );
    }

    const event =
      await prisma.securityEvent.create({
        data: {
          type: rawType,
          severity: rawSeverity,
          status: "OPEN",
          ip: eventIp || null,
          country,
          userAgent,
          adminUserId,
          description,
          metadata,
        },
      });

    await createAuditLog({
      action: "CREATE",
      entity: "SecurityEvent",
      entityId: event.id,
      userId: String(
        session.adminUserId
      ),
      description:
        "Security event created.",
      metadata: {
        eventType: event.type,
        severity: event.severity,
        status: event.status,
        ip: eventIp,
        operator:
          session.username,
        result: "Success",
        actionLabel:
          "SECURITY_EVENT_CREATED",
      },
    });

    return apiSuccess(
      event,
      "Security event created successfully.",
      201
    );
  } catch (error) {
    console.error(
      "SECURITY EVENT CREATE ERROR:",
      error
    );

    return apiServerError(
      "Failed to create security event.",
      "SECURITY_EVENT_CREATE_FAILED"
    );
  }
}

export async function PATCH(
  request: NextRequest
) {
  try {
    const session =
      await getAdminSession();

    if (!session) {
      return apiUnauthorized(
        "Unauthorized.",
        "UNAUTHORIZED"
      );
    }

    const ip = getClientIp(request);

    const limit = rateLimit(
      `security-events-patch:${ip}`,
      {
        limit: 30,
        windowMs: 60 * 60 * 1000,
      }
    );

    if (!limit.success) {
      return apiError(
        "Too many requests.",
        429,
        "RATE_LIMITED"
      );
    }

    const {
      body,
      error,
    } =
      await parseRequestJson<
        Record<string, unknown>
      >(request);

    if (error === "INVALID_JSON") {
      return apiBadRequest(
        "Invalid JSON body.",
        "INVALID_JSON"
      );
    }

    if (
      !body ||
      isEmptyJsonBody(body)
    ) {
      return apiBadRequest(
        "Request body is required.",
        "EMPTY_BODY"
      );
    }

    const action =
      typeof body.action === "string"
        ? body.action.trim()
        : "";

    if (action === "resolve_noise") {
      const noiseTypes = [
        "LOGIN_FAILED",
        "INVALID_2FA",
        "TWO_FACTOR_RATE_LIMITED",
        "RATE_LIMIT_EXCEEDED",
      ] as const;

      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const openEvents = await prisma.securityEvent.findMany({
        where: {
          status: "OPEN",
          type: {
            in: [...noiseTypes],
          },
        },
      });

      const ids = openEvents
        .filter(
          (event) =>
            isLocalIp(event.ip) || event.createdAt < cutoff
        )
        .map((event) => event.id);

      if (ids.length > 0) {
        await prisma.securityEvent.updateMany({
          where: {
            id: {
              in: ids,
            },
          },
          data: {
            status: "RESOLVED",
            resolvedAt: new Date(),
          },
        });
      }

      await createAuditLog({
        action: "UPDATE",
        entity: "SecurityEvent",
        entityId: "bulk-resolve-noise",
        userId: String(session.adminUserId),
        description: "Resolved local/old login noise events.",
        metadata: {
          resolved: ids.length,
          operator: session.username,
          result: "Success",
          actionLabel: "SECURITY_EVENT_NOISE_RESOLVED",
        },
      });

      return apiSuccess(
        {
          resolved: ids.length,
        },
        `Resolved ${ids.length} noise events.`,
        200
      );
    }

    const eventId =
      typeof body.id === "string"
        ? body.id.trim()
        : "";

    const rawStatus =
      typeof body.status === "string"
        ? body.status.trim().toUpperCase()
        : "";

    if (!eventId) {
      return apiBadRequest(
        "Security event ID is required.",
        "MISSING_EVENT_ID"
      );
    }

    if (!rawStatus) {
      return apiBadRequest(
        "Security event status is required.",
        "MISSING_STATUS"
      );
    }

    if (
      !isSecurityEventStatus(rawStatus)
    ) {
      return apiBadRequest(
        "Invalid security event status.",
        "INVALID_EVENT_STATUS"
      );
    }

    const existingEvent =
      await prisma.securityEvent.findUnique({
        where: {
          id: eventId,
        },
      });

    if (!existingEvent) {
      return apiNotFound(
        "Security event not found.",
        "SECURITY_EVENT_NOT_FOUND"
      );
    }

    const resolvedAt =
      rawStatus === "RESOLVED"
        ? new Date()
        : null;

    const event =
      await prisma.securityEvent.update({
        where: {
          id: eventId,
        },

        data: {
          status: rawStatus,
          resolvedAt,
        },
      });

    if (rawStatus === "RESOLVED" && existingEvent.ip) {
      await prisma.securityEvent.updateMany({
        where: {
          ip: existingEvent.ip,
          type: existingEvent.type,
          status: "OPEN",
        },
        data: {
          status: "RESOLVED",
          resolvedAt: new Date(),
        },
      });
    }

    await createAuditLog({
      action: "UPDATE",
      entity: "SecurityEvent",
      entityId: event.id,
      userId: String(
        session.adminUserId
      ),
      description:
        `Security event status changed to ${rawStatus}.`,
      metadata: {
        previousStatus:
          existingEvent.status,
        newStatus: rawStatus,
        eventType:
          existingEvent.type,
        severity:
          existingEvent.severity,
        ip,
        operator:
          session.username,
        result: "Success",
        actionLabel:
          "SECURITY_EVENT_STATUS_CHANGED",
      },
    });

    return apiSuccess(
      event,
      "Security event updated successfully.",
      200
    );
  } catch (error) {
    console.error(
      "SECURITY EVENT UPDATE ERROR:",
      error
    );

    return apiServerError(
      "Failed to update security event.",
      "SECURITY_EVENT_UPDATE_FAILED"
    );
  }
}

export async function DELETE() {
  return apiError(
    "Security events cannot be deleted.",
    403,
    "SECURITY_EVENT_DELETE_DISABLED"
  );
}

export async function OPTIONS() {
  return apiMethodNotAllowed(
    "Method not allowed for this route.",
    "METHOD_NOT_ALLOWED"
  );
}