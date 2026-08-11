import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/lib/prisma";

import {
  requireAdminSession,
} from "@/lib/auth/session";

import {
  apiBadRequest,
  apiMethodNotAllowed,
  apiNotFound,
  apiServerError,
} from "@/lib/api/response";

import {
  isEmptyJsonBody,
  isValidModelId,
  isValidModelLevel,
  parseRequestJson,
} from "@/lib/api/request";

import {
  rateLimit,
} from "@/lib/rateLimit";

import {
  createAuditLog,
} from "@/lib/audit/audit";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// =========================
// GET MODEL
// =========================

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } =
      await params;

    if (!isValidModelId(id)) {
      return apiBadRequest(
        "Invalid model ID.",
        "INVALID_MODEL_ID"
      );
    }

    const model =
      await prisma.model.findUnique({
        where: {
          code: id,
        },
      });

    if (!model) {
      return NextResponse.json(
        {
          message:
            "Model not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      model
    );
  } catch (error) {
    console.error(error);

    return apiServerError(
      "Failed to fetch model.",
      "FETCH_MODEL_FAILED"
    );
  }
}

// =========================
// UPDATE MODEL
// =========================

export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  try {
    const session =
      await requireAdminSession();

    const limit =
      rateLimit(
        `model-update:${session.adminUserId}`,
        {
          limit: 30,
          windowMs:
            60 * 60 * 1000,
        }
      );

    if (!limit.success) {
      return NextResponse.json(
        {
          message:
            "Too many requests.",
        },
        {
          status: 429,
        }
      );
    }

    const { id } =
      await params;

    const parsedBody =
      await parseRequestJson<
        Record<string, unknown>
      >(request);

    if (
      parsedBody.error ===
      "INVALID_JSON"
    ) {
      return apiBadRequest(
        "Invalid JSON body.",
        "INVALID_JSON"
      );
    }

    if (
      !parsedBody.body ||
      isEmptyJsonBody(
        parsedBody.body
      )
    ) {
      return apiBadRequest(
        "Request body is required.",
        "EMPTY_BODY"
      );
    }

    const body =
      parsedBody.body as Record<
        string,
        unknown
      >;

    const oldModel =
      await prisma.model.findUnique({
        where: {
          id: Number(id),
        },
      });

    if (!oldModel) {
      return apiNotFound(
        "Model not found.",
        "MODEL_NOT_FOUND"
      );
    }

    const level:
      typeof oldModel.level =
      (
        typeof body.level ===
          "string" &&
        isValidModelLevel(
          body.level
        )
          ? body.level
          : oldModel.level
      ) as typeof oldModel.level;

    const numberValue =
      typeof body.number ===
        "number" ||
      typeof body.number ===
        "string"
        ? Number(body.number)
        : oldModel.number;

    const number =
      Number(numberValue);

    const code =
      level +
      String(number).padStart(
        3,
        "0"
      );

    const model =
      await prisma.model.update({
        where: {
          id: Number(id),
        },

        data: {
          level,

          number,

          code,

          title:
            typeof body.title ===
            "string"
              ? body.title
              : oldModel.title,

          age:
            Number(
              typeof body.age ===
                "number" ||
              typeof body.age ===
                "string"
                ? body.age
                : oldModel.age
            ),

          height:
            Number(
              typeof body.height ===
                "number" ||
              typeof body.height ===
                "string"
                ? body.height
                : oldModel.height
            ),

          weight:
            Number(
              typeof body.weight ===
                "number" ||
              typeof body.weight ===
                "string"
                ? body.weight
                : oldModel.weight
            ),

          nationality:
            typeof body.nationality ===
            "string"
              ? body.nationality
              : oldModel.nationality,

          city:
            typeof body.city ===
            "string"
              ? body.city
              : oldModel.city,

          languages:
            typeof body.languages ===
            "string"
              ? body.languages
              : oldModel.languages,

          services:
            typeof body.services ===
            "string"
              ? body.services
              : oldModel.services,

          avatar:
            typeof body.avatar ===
            "string"
              ? body.avatar
              : oldModel.avatar,

          gallery:
            typeof body.gallery ===
            "string"
              ? body.gallery
              : oldModel.gallery,

          videos:
            typeof body.videos ===
            "string"
              ? body.videos
              : oldModel.videos,

          introduction:
            typeof body.introduction ===
            "string"
              ? body.introduction
              : oldModel.introduction,

          introductionEn:
            typeof body.introductionEn ===
            "string"
              ? body.introductionEn
              : oldModel.introductionEn,

          introductionZhTW:
            typeof body.introductionZhTW ===
            "string"
              ? body.introductionZhTW
              : oldModel.introductionZhTW,

          introductionZhCN:
            typeof body.introductionZhCN ===
            "string"
              ? body.introductionZhCN
              : oldModel.introductionZhCN,

          introductionJa:
            typeof body.introductionJa ===
            "string"
              ? body.introductionJa
              : oldModel.introductionJa,

          introductionKo:
            typeof body.introductionKo ===
            "string"
              ? body.introductionKo
              : oldModel.introductionKo,

          online:
            typeof body.online ===
            "boolean"
              ? body.online
              : Boolean(
                  oldModel.online
                ),

          featured:
            typeof body.featured ===
            "boolean"
              ? body.featured
              : Boolean(
                  oldModel.featured
                ),
        },
      });

    await createAuditLog({
      action:
        "EDIT_MODEL",

      entity:
        "Model",

      entityId:
        model.id,

      userId:
        String(
          session.adminUserId
        ),

      description:
        "Admin updated model.",

      metadata: {
        modelCode:
          model.code,

        operator:
          "Admin",

        result:
          "Success",

        actionLabel:
          "Edit Model",
      },
    });

    return NextResponse.json(
      model
    );
  } catch (error) {
    console.error(error);

    return apiServerError(
      "Update failed.",
      "UPDATE_MODEL_FAILED"
    );
  }
}

// =========================
// DELETE MODEL
// =========================

export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  try {
    const session =
      await requireAdminSession();

    const limit =
      rateLimit(
        `model-delete:${session.adminUserId}`,
        {
          limit: 10,
          windowMs:
            60 * 60 * 1000,
        }
      );

    if (!limit.success) {
      return NextResponse.json(
        {
          message:
            "Too many requests.",
        },
        {
          status: 429,
        }
      );
    }

    const { id } =
      await params;

    if (!isValidModelId(id)) {
      return apiBadRequest(
        "Invalid model ID.",
        "INVALID_MODEL_ID"
      );
    }

    const model =
      await prisma.model.findUnique({
        where: {
          id: Number(id),
        },
      });

    if (!model) {
      return NextResponse.json(
        {
          message:
            "Model not found.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.model.delete({
      where: {
        id: Number(id),
      },
    });

    await createAuditLog({
      action:
        "DELETE_MODEL",

      entity:
        "Model",

      entityId:
        model.id,

      userId:
        String(
          session.adminUserId
        ),

      description:
        "Admin deleted model.",

      metadata: {
        modelCode:
          model.code,

        operator:
          "Admin",

        result:
          "Success",

        actionLabel:
          "Delete Model",
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return apiServerError(
      "Delete failed.",
      "DELETE_MODEL_FAILED"
    );
  }
}