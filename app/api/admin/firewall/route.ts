import { NextRequest } from "next/server";
import { isIP } from "node:net";

import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rateLimit";
import { createAuditLog } from "@/lib/audit/audit";

import {
  apiBadRequest,
  apiConflict,
  apiError,
  apiMethodNotAllowed,
  apiNotFound,
  apiServerError,
  apiUnauthorized,
  apiSuccess,
} from "@/lib/api/response";

import {
  isEmptyJsonBody,
  parseRequestJson,
} from "@/lib/api/request";

type FirewallBlockType = "IP" | "COUNTRY";

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

function normalizeType(value: unknown): FirewallBlockType | null {
  if (value === "IP" || value === "COUNTRY") {
    return value;
  }

  return null;
}

function normalizeValue(
  type: FirewallBlockType,
  value: unknown
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (type === "IP") {
    if (isIP(normalized) === 0) {
      return null;
    }

    return normalized;
  }

  const country = normalized.toUpperCase();

  if (!/^[A-Z]{2}$/.test(country)) {
    return null;
  }

  return country;
}

// =====================================================
// GET
// Get all firewall blocks
// =====================================================

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
      `admin-firewall-get:${ip}`,
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

    const blocks = await prisma.firewallBlock.findMany({
      orderBy: [
        {
          enabled: "desc",
        },
        {
          type: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    const statistics = {
      total: blocks.length,
      enabled: blocks.filter(
        (block) => block.enabled
      ).length,
      disabled: blocks.filter(
        (block) => !block.enabled
      ).length,
      ip: blocks.filter(
        (block) => block.type === "IP"
      ).length,
      country: blocks.filter(
        (block) => block.type === "COUNTRY"
      ).length,
    };

    return apiSuccess(
      {
        blocks,
        statistics,
      },
      "Firewall blocks fetched.",
      200
    );
  } catch (error) {
    console.error(
      "GET FIREWALL BLOCKS ERROR:",
      error
    );

    return apiServerError(
      "Failed to fetch firewall blocks.",
      "FETCH_FIREWALL_BLOCKS_FAILED"
    );
  }
}

// =====================================================
// POST
// Create firewall block
// =====================================================

export async function POST(request: NextRequest) {
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
      `admin-firewall-create:${ip}`,
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

    const parsed = await parseRequestJson<
      Record<string, unknown>
    >(request);

    if (parsed.error === "INVALID_JSON") {
      return apiBadRequest(
        "Invalid JSON body.",
        "INVALID_JSON"
      );
    }

    if (
      !parsed.body ||
      isEmptyJsonBody(parsed.body)
    ) {
      return apiBadRequest(
        "Request body is required.",
        "EMPTY_BODY"
      );
    }

    const body = parsed.body;

    const type = normalizeType(body.type);

    if (!type) {
      return apiBadRequest(
        "Type must be IP or COUNTRY.",
        "INVALID_FIREWALL_TYPE"
      );
    }

    const value = normalizeValue(
      type,
      body.value
    );

    if (!value) {
      return apiBadRequest(
        type === "IP"
          ? "A valid IP address is required."
          : "A valid two-letter country code is required.",
        "INVALID_FIREWALL_VALUE"
      );
    }

    const existing =
      await prisma.firewallBlock.findUnique({
        where: {
          value,
        },
      });

    if (existing) {
      return apiConflict(
        "This firewall block already exists.",
        "FIREWALL_BLOCK_EXISTS"
      );
    }

    const block =
      await prisma.firewallBlock.create({
        data: {
          type,
          value,
          enabled: true,
        },
      });

    await createAuditLog({
      action: "CREATE",
      entity: "FirewallBlock",
      entityId: block.id,
      userId: String(
        session.adminUserId
      ),
      description:
        "Firewall block created.",
      metadata: {
        type: block.type,
        value: block.value,
        enabled: block.enabled,
        operator: "Admin",
        result: "Success",
        actionLabel: "CREATE_FIREWALL_BLOCK",
        ip,
      },
    });

    return apiSuccess(
      block,
      "Firewall block created.",
      201
    );
  } catch (error) {
    console.error(
      "CREATE FIREWALL BLOCK ERROR:",
      error
    );

    return apiServerError(
      "Failed to create firewall block.",
      "CREATE_FIREWALL_BLOCK_FAILED"
    );
  }
}

// =====================================================
// PATCH
// Enable / disable firewall block
// =====================================================

export async function PATCH(request: NextRequest) {
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
      `admin-firewall-update:${ip}`,
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

    const parsed = await parseRequestJson<
      Record<string, unknown>
    >(request);

    if (parsed.error === "INVALID_JSON") {
      return apiBadRequest(
        "Invalid JSON body.",
        "INVALID_JSON"
      );
    }

    if (
      !parsed.body ||
      isEmptyJsonBody(parsed.body)
    ) {
      return apiBadRequest(
        "Request body is required.",
        "EMPTY_BODY"
      );
    }

    const body = parsed.body;

    const id =
      typeof body.id === "string"
        ? body.id.trim()
        : "";

    if (!id) {
      return apiBadRequest(
        "Firewall block ID is required.",
        "MISSING_FIREWALL_BLOCK_ID"
      );
    }

    if (typeof body.enabled !== "boolean") {
      return apiBadRequest(
        "Enabled must be a boolean.",
        "INVALID_ENABLED_VALUE"
      );
    }

    const existing =
      await prisma.firewallBlock.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return apiNotFound(
        "Firewall block not found.",
        "FIREWALL_BLOCK_NOT_FOUND"
      );
    }

    const block =
      await prisma.firewallBlock.update({
        where: {
          id,
        },
        data: {
          enabled: body.enabled,
        },
      });

    await createAuditLog({
      action: "UPDATE",
      entity: "FirewallBlock",
      entityId: block.id,
      userId: String(
        session.adminUserId
      ),
      description:
        body.enabled
          ? "Firewall block enabled."
          : "Firewall block disabled.",
      metadata: {
        type: block.type,
        value: block.value,
        enabled: block.enabled,
        operator: "Admin",
        result: "Success",
        actionLabel:
          body.enabled
            ? "ENABLE_FIREWALL_BLOCK"
            : "DISABLE_FIREWALL_BLOCK",
        ip,
      },
    });

    return apiSuccess(
      block,
      body.enabled
        ? "Firewall block enabled."
        : "Firewall block disabled.",
      200
    );
  } catch (error) {
    console.error(
      "UPDATE FIREWALL BLOCK ERROR:",
      error
    );

    return apiServerError(
      "Failed to update firewall block.",
      "UPDATE_FIREWALL_BLOCK_FAILED"
    );
  }
}

// =====================================================
// DELETE
// Remove firewall block
// =====================================================

export async function DELETE(request: NextRequest) {
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
      `admin-firewall-delete:${ip}`,
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

    const parsed = await parseRequestJson<
      Record<string, unknown>
    >(request);

    if (parsed.error === "INVALID_JSON") {
      return apiBadRequest(
        "Invalid JSON body.",
        "INVALID_JSON"
      );
    }

    if (
      !parsed.body ||
      isEmptyJsonBody(parsed.body)
    ) {
      return apiBadRequest(
        "Request body is required.",
        "EMPTY_BODY"
      );
    }

    const body = parsed.body;

    const id =
      typeof body.id === "string"
        ? body.id.trim()
        : "";

    if (!id) {
      return apiBadRequest(
        "Firewall block ID is required.",
        "MISSING_FIREWALL_BLOCK_ID"
      );
    }

    const existing =
      await prisma.firewallBlock.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return apiNotFound(
        "Firewall block not found.",
        "FIREWALL_BLOCK_NOT_FOUND"
      );
    }

    await prisma.firewallBlock.delete({
      where: {
        id,
      },
    });

    await createAuditLog({
      action: "DELETE",
      entity: "FirewallBlock",
      entityId: id,
      userId: String(
        session.adminUserId
      ),
      description:
        "Firewall block deleted.",
      metadata: {
        type: existing.type,
        value: existing.value,
        enabled: existing.enabled,
        operator: "Admin",
        result: "Success",
        actionLabel:
          "DELETE_FIREWALL_BLOCK",
        ip,
      },
    });

    return apiSuccess(
      null,
      "Firewall block deleted.",
      200
    );
  } catch (error) {
    console.error(
      "DELETE FIREWALL BLOCK ERROR:",
      error
    );

    return apiServerError(
      "Failed to delete firewall block.",
      "DELETE_FIREWALL_BLOCK_FAILED"
    );
  }
}

// =====================================================
// OPTIONS
// =====================================================

export async function OPTIONS() {
  return apiMethodNotAllowed(
    "Method not allowed for this route.",
    "METHOD_NOT_ALLOWED"
  );
}