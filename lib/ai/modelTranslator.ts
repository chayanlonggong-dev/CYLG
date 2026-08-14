const OLLAMA_URL = "http://127.0.0.1:11434/api/chat";
const MODEL = "qwen2.5:3b";

export type TranslationLanguage =
  | "zhTW"
  | "zhCN"
  | "ja"
  | "ko";

export interface TranslationResult {
  language: TranslationLanguage;
  text: string;
}

interface ValidationResult {
  ok: boolean;
  reason?: string;
  soft?: boolean;
}

const LANGUAGE_CONFIG: Record<
  TranslationLanguage,
  { name: string }
> = {
  zhTW: { name: "Traditional Chinese" },
  zhCN: { name: "Simplified Chinese" },
  ja: { name: "Japanese" },
  ko: { name: "Korean" },
};

function extractNumbers(text: string): string[] {
  return text.match(/\d[\d,]*(?:\.\d+)?/g) ?? [];
}

function normalizeNumber(value: string): string {
  return value.replace(/,/g, "");
}

function hasCjk(text: string): boolean {
  return /[\u4E00-\u9FFF]/.test(text);
}

function hasKana(text: string): boolean {
  return /[\u3040-\u30FF]/.test(text);
}

function hasHangul(text: string): boolean {
  return /[\uAC00-\uD7AF]/.test(text);
}

function sourceMentionsUsd(text: string): boolean {
  return /(?:\bUSD\b|\bUS\$|\$|dollars?\b)/i.test(text);
}

function countNonEmptyLines(text: string): number {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean).length;
}

function countColonLines(text: string): number {
  return text
    .split(/\r?\n/)
    .filter((line) => line.includes(":")).length;
}

function isStructuredSource(source: string): boolean {
  const lines = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 3) {
    return false;
  }

  const colonLines = lines.filter((line) =>
    line.includes(":")
  ).length;

  return colonLines / lines.length >= 0.5;
}

function validateLanguageHard(
  language: TranslationLanguage,
  text: string
): ValidationResult {
  if (!text.trim()) {
    return {
      ok: false,
      reason: "Translation is empty.",
    };
  }

  if (language === "zhTW" || language === "zhCN") {
    if (!hasCjk(text)) {
      return {
        ok: false,
        reason: "Chinese translation contains no Chinese characters.",
      };
    }
    return { ok: true };
  }

  if (language === "ja") {
    if (!hasKana(text) && !hasCjk(text)) {
      return {
        ok: false,
        reason: "Japanese translation contains no Japanese characters.",
      };
    }
    return { ok: true };
  }

  if (language === "ko") {
    if (!hasHangul(text)) {
      return {
        ok: false,
        reason: "Korean translation contains no Hangul.",
      };
    }
    return { ok: true };
  }

  return { ok: true };
}

function validateSoft(
  language: TranslationLanguage,
  source: string,
  translated: string
): ValidationResult {
  const sourceNumbers = [
    ...new Set(extractNumbers(source).map(normalizeNumber)),
  ];
  const translatedNumbers = new Set(
    extractNumbers(translated).map(normalizeNumber)
  );

  if (sourceNumbers.length > 0) {
    const missing = sourceNumbers.filter(
      (n) => !translatedNumbers.has(n)
    );
    if (missing.length > Math.ceil(sourceNumbers.length * 0.5)) {
      return {
        ok: false,
        soft: true,
        reason: `Many source numbers missing (e.g. ${missing.slice(0, 3).join(", ")}).`,
      };
    }
  }

  if (isStructuredSource(source)) {
    const sourceLines = countNonEmptyLines(source);
    const translatedLines = countNonEmptyLines(translated);

    if (
      sourceLines >= 8 &&
      translatedLines > 0 &&
      translatedLines < Math.max(3, Math.floor(sourceLines * 0.35))
    ) {
      return {
        ok: false,
        soft: true,
        reason:
          "Translation collapsed field list into a short paragraph.",
      };
    }

    const sourceColon = countColonLines(source);
    const translatedColon = countColonLines(translated);

    if (
      sourceColon >= 8 &&
      translatedColon < Math.max(2, Math.floor(sourceColon * 0.3))
    ) {
      return {
        ok: false,
        soft: true,
        reason: "Translation lost most Label: Value field lines.",
      };
    }
  }

  if (sourceMentionsUsd(source)) {
    const t = translated;
    const keepsUsd = /(?:\bUSD\b|\$|美元|美金|米ドル|ドル|달러)/i.test(
      t
    );

    if (!keepsUsd) {
      if (
        (language === "zhTW" || language === "zhCN") &&
        /元/.test(t) &&
        !/(?:美元|美金)/.test(t)
      ) {
        return {
          ok: false,
          soft: true,
          reason:
            "USD appears converted to bare 元. Prefer 美元 / 美金 / USD.",
        };
      }
      if (language === "ja" && /円/.test(t) && !/ドル/.test(t)) {
        return {
          ok: false,
          soft: true,
          reason:
            "USD appears converted to 円. Prefer USD / ドル / 米ドル.",
        };
      }
      if (language === "ko" && /원/.test(t) && !/달러/.test(t)) {
        return {
          ok: false,
          soft: true,
          reason:
            "USD appears converted to 원. Prefer USD / 달러.",
        };
      }
    }
  }

  return { ok: true };
}

function validateTranslation(
  language: TranslationLanguage,
  source: string,
  translated: string,
  isLastAttempt: boolean
): ValidationResult {
  const hard = validateLanguageHard(language, translated);
  if (!hard.ok) {
    return hard;
  }

  const soft = validateSoft(language, source, translated);
  if (!soft.ok) {
    if (isLastAttempt) {
      return { ok: true };
    }
    return soft;
  }

  return { ok: true };
}

function buildPrompt(
  language: TranslationLanguage,
  source: string
): string {
  const languageName = LANGUAGE_CONFIG[language].name;

  const languageSpecific =
    language === "zhTW"
      ? `
Target language: Traditional Chinese (繁體中文) ONLY.
- Every label and every value must be written in Traditional Chinese.
- Do NOT leave English words mixed in (except unavoidable proper nouns, codes, or USD).
- Do NOT output Simplified Chinese characters when Traditional exists.
- For US dollars: write "美元" or "美金" or keep "USD". Never write only "元".
`
      : language === "zhCN"
        ? `
Target language: Simplified Chinese (简体中文) ONLY.
- Every label and every value must be written in Simplified Chinese.
- Do NOT leave English words mixed in (except unavoidable proper nouns, codes, or USD).
- For US dollars: write "美元" or "美金" or keep "USD". Never write only "元".
`
        : language === "ja"
          ? `
Target language: Japanese ONLY.
- Use natural Japanese (漢字 / ひらがな / カタカナ).
- Do NOT leave ordinary English sentences untranslated.
- Do NOT write a narrative paragraph if the source is a field list.
- One source line → one Japanese line, same order.
- For US dollars: write "USD" or "米ドル" or "ドル". Never convert to "円".
`
          : `
Target language: Korean (Hangul) ONLY.
- Write in Hangul.
- Do NOT leave ordinary English sentences untranslated.
- Do NOT write a narrative paragraph if the source is a field list.
- One source line → one Korean line, same order.
- For US dollars: write "USD" or "달러". Never convert to "원".
`;

  const structureBlock = isStructuredSource(source)
    ? `
STRUCTURE (REQUIRED):
The source is a "Label: Value" field list.
- Keep the SAME number of lines and the SAME order.
- Keep the colon ":" on each field line.
- Translate BOTH the label and the value.
- If a value is empty (e.g. "Foursome:"), keep the label and colon with an empty value.
- Do NOT merge fields into a paragraph.
- Do NOT add or remove fields.
`
    : `
STRUCTURE:
- Preserve line breaks and overall layout when present.
- Do not add commentary.
`;

  const currencyBlock = sourceMentionsUsd(source)
    ? `
CURRENCY:
This source uses US dollars (USD / $ / dollar).
Preserve US-dollar meaning. Do not convert to local yuan/yen/won.
`
    : "";

  return `
You are a professional native translator specializing in ${languageName}.

Translate the SOURCE into ${languageName}.

${languageSpecific}

${structureBlock}

${currencyBlock}

ACCURACY RULES:
1. Keep the exact factual meaning. Do not invent, omit, or change facts.
2. Keep every number exactly as written (23, 173, +300, 1500, etc.).
3. Do not convert currencies or change units.
4. Translate field labels and values fully into the target language.
5. Do not mix the target language with English prose.
6. Return ONLY the translation text. No markdown. No explanations. No title.

SOURCE:
${source}
`.trim();
}

function cleanModelOutput(text: string): string {
  let result = text.trim();

  result = result.replace(/^```[a-zA-Z]*\s*/m, "").replace(/```$/m, "");

  result = result.replace(
    /^(?:translation|translated\s*text|output|結果|翻译|翻譯|日本語|한국어)\s*[:：]\s*/i,
    ""
  );

  return result.trim();
}

async function requestTranslation(
  language: TranslationLanguage,
  source: string
): Promise<string> {
  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      stream: false,
      options: {
        temperature: 0.2,
        top_p: 0.9,
      },
      messages: [
        {
          role: "system",
          content: `You are a careful professional translator into ${LANGUAGE_CONFIG[language].name}.
Return only the translation.
Preserve field-list structure (one Label: Value per line) when the source is structured.
Never convert currencies. USD/dollar must stay USD meaning (美元/美金/USD/ドル/달러), never bare 元/円/원.
Do not mix English into Chinese/Japanese/Korean output except for USD, codes, or proper nouns.
Keep numbers unchanged.`,
        },
        {
          role: "user",
          content: buildPrompt(language, source),
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Ollama HTTP ${response.status}${body ? `: ${body.slice(0, 200)}` : ""}`
    );
  }

  const data = await response.json();
  const text = data?.message?.content;

  if (typeof text !== "string" || !text.trim()) {
    throw new Error(
      `Ollama returned an empty translation for ${language}.`
    );
  }

  return cleanModelOutput(text);
}

export async function translateIntroduction(
  language: TranslationLanguage,
  source: string,
  maxAttempts = 3
): Promise<TranslationResult> {
  const cleanSource = source.trim();

  if (!cleanSource) {
    throw new Error("Cannot translate an empty introduction.");
  }

  let lastValidationError = "Unknown validation error.";
  let lastText = "";

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const isLastAttempt = attempt === maxAttempts;
    const text = await requestTranslation(language, cleanSource);
    lastText = text;

    const validation = validateTranslation(
      language,
      cleanSource,
      text,
      isLastAttempt
    );

    if (validation.ok) {
      return {
        language,
        text,
      };
    }

    lastValidationError =
      validation.reason ?? "Translation validation failed.";
  }

  const hard = validateLanguageHard(language, lastText);
  if (hard.ok && lastText.trim()) {
    return {
      language,
      text: lastText,
    };
  }

  throw new Error(
    `Translation validation failed for ${language} after ${maxAttempts} attempts: ${lastValidationError}`
  );
}

export async function translateIntroductionBatch(
  languages: TranslationLanguage[],
  source: string
): Promise<{
  translations: Partial<Record<TranslationLanguage, string>>;
  errors: Partial<Record<TranslationLanguage, string>>;
}> {
  const translations: Partial<
    Record<TranslationLanguage, string>
  > = {};

  const errors: Partial<
    Record<TranslationLanguage, string>
  > = {};

  for (const language of languages) {
    try {
      const result = await translateIntroduction(
        language,
        source
      );

      translations[language] = result.text;
    } catch (error) {
      errors[language] =
        error instanceof Error
          ? error.message
          : String(error);
    }
  }

  return {
    translations,
    errors,
  };
}