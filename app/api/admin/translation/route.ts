import { NextRequest } from "next/server";

import {
  apiBadRequest,
  apiMethodNotAllowed,
  apiServerError,
  apiSuccess,
  apiUnauthorized,
  apiError,
} from "@/lib/api/response";

import {
  parseRequestJson,
  isEmptyJsonBody,
} from "@/lib/api/request";

import {
  requireAdminSession,
} from "@/lib/auth/session";

import {
  rateLimit,
} from "@/lib/rateLimit";

import {
  translateIntroductionBatch,
  type TranslationLanguage,
} from "@/lib/ai/modelTranslator";

const SUPPORTED_LANGUAGES: TranslationLanguage[] = [
  "zhTW",
  "zhCN",
  "ja",
  "ko",
];

const MAX_SOURCE_LENGTH = 10000;

function getClientIp(
  request: NextRequest
): string {
  return (
    request.headers
      .get("x-forwarded-for")
      ?.split(",")[0]
      ?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isSupportedLanguage(
  value: unknown
): value is TranslationLanguage {
  return (
    typeof value === "string" &&
    SUPPORTED_LANGUAGES.includes(
      value as TranslationLanguage
    )
  );
}

export async function POST(
  request: NextRequest
) {
  try {
    await requireAdminSession();

    const ip = getClientIp(request);

    const limit = rateLimit(
      `admin-translation:${ip}`,
      {
        limit: 20,
        windowMs: 60 * 60 * 1000,
      }
    );

    if (!limit.success) {
      return apiError(
        "Too many translation requests.",
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

    const source =
      typeof body.source === "string"
        ? body.source.trim()
        : "";

    if (!source) {
      return apiBadRequest(
        "Source text is required.",
        "SOURCE_REQUIRED"
      );
    }

    if (
      source.length >
      MAX_SOURCE_LENGTH
    ) {
      return apiBadRequest(
        `Source text must not exceed ${MAX_SOURCE_LENGTH} characters.`,
        "SOURCE_TOO_LONG"
      );
    }

    /*
     * If languages are supplied, translate only
     * those languages.
     *
     * This allows the frontend to skip languages
     * that already have translations.
     */
    let languages: TranslationLanguage[] =
      SUPPORTED_LANGUAGES;

    if (
      Array.isArray(body.languages)
    ) {
      const requestedLanguages =
        body.languages.filter(
          isSupportedLanguage
        );

      if (
        requestedLanguages.length === 0
      ) {
        return apiBadRequest(
          "No supported translation languages were requested.",
          "INVALID_LANGUAGES"
        );
      }

      languages = [
        ...new Set(
          requestedLanguages
        ),
      ];
    }

    /*
     * IMPORTANT:
     *
     * One batch request to Qwen can return
     * multiple target languages.
     *
     * This replaces the old:
     *
     * language -> Qwen
     * language -> Qwen
     * language -> Qwen
     * language -> Qwen
     *
     * flow.
     */
    const result =
      await translateIntroductionBatch(
        languages,
        source
      );

    const translations =
      result.translations;

    const errors =
      result.errors;

    if (
      Object.keys(translations)
        .length === 0
    ) {
      return apiServerError(
        "All requested translation languages failed.",
        "TRANSLATION_FAILED"
      );
    }

    return apiSuccess(
      {
        source,
        translations,
        errors,
        requestedLanguages:
          languages,
        model:
          "qwen3:4b-instruct",
        mode:
          "batch",
      },
      "Translation completed.",
      200
    );
  } catch (error) {
    console.error(
      "ADMIN TRANSLATION ERROR:",
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        "Unauthorized"
    ) {
      return apiUnauthorized(
        "Unauthorized.",
        "UNAUTHORIZED"
      );
    }

    return apiServerError(
      "Translation request failed.",
      "TRANSLATION_REQUEST_FAILED"
    );
  }
}

export async function GET() {
  return apiMethodNotAllowed(
    "Use POST for translation requests.",
    "METHOD_NOT_ALLOWED"
  );
}

export async function PUT() {
  return apiMethodNotAllowed(
    "Use POST for translation requests.",
    "METHOD_NOT_ALLOWED"
  );
}

export async function DELETE() {
  return apiMethodNotAllowed(
    "Use POST for translation requests.",
    "METHOD_NOT_ALLOWED"
  );
}

export async function OPTIONS() {
  return apiMethodNotAllowed(
    "Method not allowed for this route.",
    "METHOD_NOT_ALLOWED"
  );
}
