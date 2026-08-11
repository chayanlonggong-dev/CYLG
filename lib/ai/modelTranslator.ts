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

    if (hasCjk(text)) {
      return {
        ok: false,
        reason:
          "Korean translation contains Chinese/Japanese characters.",
      };
    }

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
Use Hangul naturally.
Translate ordinary English vocabulary naturally into Korean.
Do not leave ordinary English adjectives or verbs untranslated.
Do not produce Chinese/Japanese characters.
`;

  return `
You are a professional native-level translator.

Translate the source text into ${languageName}.

STRICT RULES:

- Preserve the exact meaning.
- Do not add information.
- Do not remove information.
- Do not invent facts.
- Preserve every number.
- Preserve every currency amount.
- Never convert currencies.
- Never invent a currency.
- Preserve names, brands, acronyms and technical terms when appropriate.
- Use natural native-level grammar.
- Prefer natural expressions over literal word-for-word translation.
- Return ONLY the translated text.
- Do not add explanations.
- Do not add labels.

${instructions}

Before returning, silently verify:
- all factual values are preserved
- all numbers are preserved
- all currency amounts are preserved
- the result sounds native
- ordinary English words are not unnecessarily left untranslated
- no information was invented

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
            "You are a professional native-level translator. Return only the translation.",
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