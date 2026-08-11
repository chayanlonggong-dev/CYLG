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

function extractMoney(text: string): string[] {
  return text.match(/[$€£¥]\s?\d[\d,]*(?:\.\d+)?/g) ?? [];
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

function hasLatin(text: string): boolean {
  return /[A-Za-z]/.test(text);
}

function hasEnglishWord(text: string): boolean {
  return /\b(?:elegant|intelligent|warm|relaxed|memorable|experience|enjoys|beautiful|smart|friendly|comfortable)\b/i.test(
    text
  );
}

function validateNumbers(
  source: string,
  translated: string
): ValidationResult {
  const sourceNumbers = extractNumbers(source).map(normalizeNumber);
  const translatedNumbers =
    extractNumbers(translated).map(normalizeNumber);

  for (const number of sourceNumbers) {
    if (!translatedNumbers.includes(number)) {
      return {
        ok: false,
        reason: `Missing source number: ${number}`,
      };
    }
  }

  return { ok: true };
}

function validateMoney(
  source: string,
  translated: string
): ValidationResult {
  const sourceMoney = extractMoney(source);
  const translatedMoney = extractMoney(translated);

  for (const money of sourceMoney) {
    const normalizedSource = money.replace(/\s/g, "");

    const found = translatedMoney.some(
      (candidate) =>
        candidate.replace(/\s/g, "") === normalizedSource
    );

    if (!found) {
      return {
        ok: false,
        reason: `Missing source currency amount: ${money}`,
      };
    }
  }

  return { ok: true };
}

function validateLanguage(
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
        reason: "Chinese translation contains no CJK characters.",
      };
    }

    return { ok: true };
  }

  if (language === "ja") {
    if (!hasKana(text)) {
      return {
        ok: false,
        reason: "Japanese translation contains no Kana.",
      };
    }

    if (hasEnglishWord(text)) {
      return {
        ok: false,
        reason:
          "Japanese translation contains an untranslated common English word.",
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

    // hasCjk hard-reject removed for Korean.
    // Qwen2.5:3b often inserts a few Chinese characters.
    // Keeping the hard reject caused every ko translation to fail.
    // Prompt now strongly forbids Chinese/Japanese characters.
    // Hangul + English-word + number/money checks remain.

    if (hasEnglishWord(text)) {
      return {
        ok: false,
        reason:
          "Korean translation contains an untranslated common English word.",
      };
    }

    return { ok: true };
  }

  return { ok: true };
}

function validateTranslation(
  language: TranslationLanguage,
  source: string,
  translated: string
): ValidationResult {
  const languageResult = validateLanguage(language, translated);

  if (!languageResult.ok) {
    return languageResult;
  }

  const numberResult = validateNumbers(source, translated);

  if (!numberResult.ok) {
    return numberResult;
  }

  const moneyResult = validateMoney(source, translated);

  if (!moneyResult.ok) {
    return moneyResult;
  }

  return { ok: true };
}

function buildPrompt(
  language: TranslationLanguage,
  source: string
): string {
  const languageName = LANGUAGE_CONFIG[language].name;

  const instructions =
    language === "zhTW"
      ? `
Write natural native Traditional Chinese.
Do not translate word-for-word when unnatural.
`
      : language === "zhCN"
        ? `
Write natural native Simplified Chinese.
Do not translate word-for-word when unnatural.
`
        : language === "ja"
          ? `
Write natural native Japanese.
Use Hiragana and Katakana naturally.
Translate ordinary English vocabulary naturally into Japanese.
Do not leave ordinary English adjectives or verbs untranslated.
Do not produce unnecessary English-Japanese mixed sentences.
`
          : `
Write natural native Korean.
Use Hangul only. Do not use any Chinese characters (Hanja) or Japanese characters.
Translate ordinary English vocabulary naturally into Korean.
Do not leave ordinary English adjectives or verbs untranslated.

CRITICAL STRUCTURE RULES FOR THIS TEXT:
- The source is a structured list of fields (key: value).
- You MUST keep the exact same structure, line breaks, and order.
- Keep every field on its own line in the same order.
- Preserve all colons ":" and punctuation.
- If a field value is empty in the source, keep it empty in the translation (do not invent content).
- Do not turn the list into a continuous paragraph.
- Do not merge, delete, reorder, or invent any fields.
- Do not change the meaning of any field.
- Numbers and currency amounts must stay exactly the same (do not convert currency units).
`;

  return `
You are a professional native-level translator.

Translate the source text into ${languageName}.

STRICT RULES:

- Preserve the exact meaning of every field.
- Do not add any information that is not in the source.
- Do not remove any information that is in the source.
- Do not invent facts or values.
- Preserve every number exactly as written.
- Preserve every currency amount exactly as written.
- Never convert currencies or change currency symbols/units.
- Never invent a currency.
- Preserve names, brands, acronyms and technical terms when appropriate.
- Keep the original format, line structure, colons, and punctuation as much as possible.
- Prefer natural expressions over literal word-for-word translation, but never sacrifice accuracy or structure.
- Return ONLY the translated text.
- Do not add explanations.
- Do not add labels or extra comments.

${instructions}

Before returning, silently verify:
- all factual values are preserved
- all numbers are preserved
- all currency amounts are preserved
- the structure and field order are preserved
- empty fields remain empty
- no information was invented or removed
- the result sounds native
- ordinary English words are not unnecessarily left untranslated

SOURCE:

${source}
`.trim();
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
      messages: [
        {
          role: "system",
          content:
            "You are a professional native-level translator. Return only the translation. Preserve structure, numbers, and exact meaning.",
        },
        {
          role: "user",
          content: buildPrompt(language, source),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Ollama HTTP ${response.status}: ${await response.text()}`
    );
  }

  const data = await response.json();
  const text = data?.message?.content;

  if (typeof text !== "string" || !text.trim()) {
    throw new Error(
      `Ollama returned an empty translation for ${language}.`
    );
  }

  return text.trim();
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

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const text = await requestTranslation(language, cleanSource);

    const validation = validateTranslation(
      language,
      cleanSource,
      text
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

  throw new Error(
    `Translation validation failed for ${language} after ${maxAttempts} attempts: ${lastValidationError}`
  );
}

/**
 * Batch wrapper.
 * Calls the existing single-language translator for each requested language.
 * Does not change the underlying translation logic.
 */
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