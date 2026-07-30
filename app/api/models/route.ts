import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getAllModels,
  createModel,
} from "@/lib/modelService";

import {
  apiBadRequest,
  apiMethodNotAllowed,
  apiServerError,
  apiSuccess,
  apiError,
  apiUnauthorized,
} from "@/lib/api/response";

import {
  isEmptyJsonBody,
  isValidModelLevel,
  parseRequestJson,
} from "@/lib/api/request";

import {
  requireAdminSession,
} from "@/lib/auth/session";

import {
  createAuditLog,
} from "@/lib/audit/audit";

import {
  rateLimit,
} from "@/lib/rateLimit";


function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown"
  );
}

// =======================
// GET ALL MODELS
// =======================
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    const limit = rateLimit(`models-get:${ip}`, { limit: 60, windowMs: 60 * 1000 });
    if (!limit.success) {
      return apiError("Too many requests.", 429, "RATE_LIMITED");
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const level = searchParams.get("level")?.trim() || "";

    const models = await getAllModels();

    const filtered = models.filter((model: any) => {
      const matchLevel = !level || level === "ALL" || model.level === level;
      const keyword = search.toLowerCase();
      const matchSearch =
        !search ||
        model.code.toLowerCase().includes(keyword) ||
        model.title?.toLowerCase().includes(keyword) ||
        model.city?.toLowerCase().includes(keyword) ||
        model.nationality?.toLowerCase().includes(keyword);
      return matchLevel && matchSearch;
    });

    return apiSuccess(filtered, "Models fetched.", 200);
  } catch (error) {
    console.error("GET MODELS ERROR:", error);
    return apiServerError("Failed to fetch models.", "FETCH_MODELS_FAILED");
  }
}

// =======================
// CREATE MODEL
// =======================
export async function POST(request: NextRequest) {
  try {
    // Admin Protection
    const session = await requireAdminSession();
    const ip = getClientIp(request);

    const limit = rateLimit(`models-create:${ip}`, { limit: 10, windowMs: 60 * 60 * 1000 });
    if (!limit.success) {
      return apiError("Too many create requests.", 429, "RATE_LIMITED");
    }

    const { body, error } = await parseRequestJson<Record<string, unknown>>(request);
    if (error === "INVALID_JSON") {
      return apiBadRequest("Invalid JSON body.", "INVALID_JSON");
    }
    if (!body || isEmptyJsonBody(body)) {
      return apiBadRequest("Request body is required.", "EMPTY_BODY");
    }

    const level = typeof body.level === "string" ? body.level : "CROWN";
    const title = typeof body.title === "string" ? body.title : "";

    if (!isValidModelLevel(level)) {
      return apiBadRequest("Invalid model level.", "INVALID_MODEL_LEVEL");
    }

    const model = await createModel({
      level: level as "CROWN" | "SSS" | "SS" | "S" | "A",
      title,
      age: Number(body.age ?? 18),
      height: Number(body.height ?? 160),
      weight: Number(body.weight ?? 50),
      nationality: typeof body.nationality === "string" ? body.nationality : "",
      city: typeof body.city === "string" ? body.city : "",
      languages: typeof body.languages === "string" ? body.languages : "",
      services: typeof body.services === "string" ? body.services : "",
      avatar: typeof body.avatar === "string" ? body.avatar : "",
      gallery: typeof body.gallery === "string" ? body.gallery : "",
      videos: typeof body.videos === "string" ? body.videos : "",
      introduction: typeof body.introduction === "string" ? body.introduction : "",
      online: typeof body.online === "boolean" ? body.online : true,
      featured: typeof body.featured === "boolean" ? body.featured : false,
    });

    await createAuditLog({
      action: "CREATE_MODEL",
      entity: "Model",
      entityId: model.id,
      userId: String(session.adminUserId),
      description: "Admin created model.",
      metadata: {
        modelCode: model.code,
        operator: "Admin",
        result: "Success",
        actionLabel: "Create Model",
      },
    });

    return apiSuccess(model, "Model created successfully", 201);
  } catch (error: any) {
    const session = await requireAdminSession().catch(() => null);
    let body: Record<string, unknown> = {};

    try {
      body = await request.json().catch(() => ({}));
    } catch {
      body = {};
    }

    console.error("CREATE MODEL ERROR:", error);

    const modelCode = body.level && body.number
      ? `${String(body.level)}${String(body.number).padStart(3, "0")}`
      : typeof body.code === "string"
        ? body.code
        : null;

    await createAuditLog({
      action: "CREATE_MODEL",
      entity: "Model",
      entityId: undefined,
      userId: session ? String(session.adminUserId) : "admin",
      description: "Admin failed to create model.",
      metadata: {
        modelCode,
        operator: "Admin",
        result: "Failed",
        actionLabel: "Create Model",
      },
    }).catch(() => undefined);

    if (error?.message === "Unauthorized") {
      return apiUnauthorized("Unauthorized.", "UNAUTHORIZED");
    }

    return apiServerError("Create model failed.", "CREATE_MODEL_FAILED");
  }
}

export async function OPTIONS() {
  return apiMethodNotAllowed("Method not allowed for this route.", "METHOD_NOT_ALLOWED");
}
