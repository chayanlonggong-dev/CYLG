import { prisma } from "@/lib/prisma";

import {
  translateIntroduction,
  type TranslationLanguage,
} from "@/lib/ai/modelTranslator";

const LANGUAGES: TranslationLanguage[] = [
  "zhTW",
  "zhCN",
  "ja",
  "ko",
];

/*
 * ============================================================
 * PRODUCTION TRANSLATION BACKFILL
 * ============================================================
 *
 * Source of truth:
 *
 *   model.introduction
 *
 * This script NEVER modifies:
 *
 *   model.introduction
 *   model.introductionEn
 *
 * It only writes:
 *
 *   introductionZhTW
 *   introductionZhCN
 *   introductionJa
 *   introductionKo
 *
 * A model is written only when all four translations succeed.
 *
 * The script is safe to restart:
 *
 * - Complete models are skipped.
 * - Incomplete models are regenerated from the original
 *   English introduction.
 * - Failed models do not stop the entire batch.
 */

interface TranslationResultMap {
  zhTW?: string;
  zhCN?: string;
  ja?: string;
  ko?: string;
}

function hasTranslation(
  value: string | null | undefined
): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function getExistingTranslations(model: {
  introductionZhTW: string | null;
  introductionZhCN: string | null;
  introductionJa: string | null;
  introductionKo: string | null;
}): TranslationResultMap {
  return {
    zhTW: hasTranslation(model.introductionZhTW)
      ? model.introductionZhTW ?? undefined
      : undefined,

    zhCN: hasTranslation(model.introductionZhCN)
      ? model.introductionZhCN ?? undefined
      : undefined,

    ja: hasTranslation(model.introductionJa)
      ? model.introductionJa ?? undefined
      : undefined,

    ko: hasTranslation(model.introductionKo)
      ? model.introductionKo ?? undefined
      : undefined,
  };
}

function isFullyTranslated(
  translations: TranslationResultMap
): boolean {
  return Boolean(
    translations.zhTW &&
      translations.zhCN &&
      translations.ja &&
      translations.ko
  );
}

async function main() {
  console.log("=== MODEL TRANSLATION BACKFILL ===");
  console.log("");
  console.log("MODE: PRODUCTION");
  console.log("SOURCE: model.introduction");
  console.log("LANGUAGES: zhTW, zhCN, ja, ko");
  console.log("");

  const models = await prisma.model.findMany({
    orderBy: {
      code: "asc",
    },
  });

  console.log(
    `TOTAL MODELS FOUND: ${models.length}`
  );

  console.log("");

  let skipped = 0;
  let translated = 0;
  let failed = 0;
  let withoutSource = 0;

  const failedModels: string[] = [];

  for (const model of models) {
    console.log("========================================");
    console.log(`MODEL: ${model.code}`);
    console.log("========================================");

    /*
     * The original English introduction is the only source.
     */
    const source =
      model.introduction?.trim() || "";

    if (!source) {
      withoutSource++;

      console.log(
        "STATUS: SKIPPED - NO ENGLISH SOURCE"
      );

      console.log("");

      continue;
    }

    const existing =
      getExistingTranslations(model);

    /*
     * Fully translated models are left untouched.
     */
    if (isFullyTranslated(existing)) {
      skipped++;

      console.log(
        "STATUS: SKIPPED - ALREADY FULLY TRANSLATED"
      );

      console.log("");

      continue;
    }

    console.log(
      `SOURCE LENGTH: ${source.length}`
    );

    console.log("");

    const translations: TranslationResultMap = {};

    let modelFailed = false;

    /*
     * We intentionally translate sequentially.
     *
     * Qwen3 is running locally, so sequential requests
     * reduce GPU/RAM pressure.
     */
    for (const language of LANGUAGES) {
      console.log(
        `${language}: translating...`
      );

      try {
        const result =
          await translateIntroduction(
            language,
            source
          );

        translations[language] =
          result.text;

        console.log(
          `${language}: SUCCESS`
        );
      } catch (error) {
        modelFailed = true;

        console.error(
          `${language}: FAILED`
        );

        console.error(
          error instanceof Error
            ? error.message
            : String(error)
        );
      }
    }

    /*
     * Never partially update a model.
     *
     * If any language failed, nothing is written.
     */
    if (
      modelFailed ||
      !translations.zhTW ||
      !translations.zhCN ||
      !translations.ja ||
      !translations.ko
    ) {
      failed++;

      failedModels.push(model.code);

      console.log("");

      console.log(
        "DATABASE WRITE: SKIPPED"
      );

      console.log(
        "STATUS: FAILED - NO PARTIAL WRITE"
      );

      console.log("");

      continue;
    }

    /*
     * Only the four translated fields are updated.
     *
     * Original English fields remain untouched.
     */
    await prisma.model.update({
      where: {
        id: model.id,
      },

      data: {
        introductionZhTW:
          translations.zhTW,

        introductionZhCN:
          translations.zhCN,

        introductionJa:
          translations.ja,

        introductionKo:
          translations.ko,
      },
    });

    translated++;

    console.log("");

    console.log(
      "DATABASE WRITE: SUCCESS"
    );

    console.log(
      "STATUS: TRANSLATED"
    );

    console.log(
      "ORIGINAL ENGLISH: UNCHANGED"
    );

    console.log("");
  }

  console.log("");
  console.log("========================================");
  console.log("TRANSLATION BACKFILL COMPLETE");
  console.log("========================================");
  console.log("");

  console.log(
    `TOTAL MODELS: ${models.length}`
  );

  console.log(
    `TRANSLATED: ${translated}`
  );

  console.log(
    `SKIPPED ALREADY COMPLETE: ${skipped}`
  );

  console.log(
    `FAILED: ${failed}`
  );

  console.log(
    `WITHOUT ENGLISH SOURCE: ${withoutSource}`
  );

  console.log("");

  if (failedModels.length > 0) {
    console.log(
      "FAILED MODEL CODES:"
    );

    for (const code of failedModels) {
      console.log(`- ${code}`);
    }

    console.log("");
  }

  console.log(
    "Original English introductions were never modified."
  );
}

main()
  .catch((error) => {
    console.error("");
    console.error(
      "BACKFILL FATAL ERROR:"
    );

    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
