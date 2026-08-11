const OLLAMA_URL = "http://127.0.0.1:11434/api/chat";
const MODEL = "qwen3:4b-instruct";

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

interface MoneyValue {
  symbol: "$" | "€" | "£" | "¥";
  amount: string;
}

const LANGUAGE_CONFIG: Record<
  TranslationLanguage,
  { name: string }
> = {
  zhTW: {
    name: "Traditional Chinese",
  },
  zhCN: {
    name: "Simplified Chinese",
  },
  ja: {
    name: "Japanese",
  },
  ko: {
    name: "Korean",
  },
};

/*
 * ============================================================
 * TRANSLATION GLOSSARY
 * ============================================================
 *
 * These are structured model-profile fields.
 *
 * They must not be freely reinterpreted by the language model.
 */

const GLOSSARY: Record<
  TranslationLanguage,
  Record<string, string>
> = {
  zhTW: {
    "Occupation": "職業",
    "Unemployed": "無業",
    "Age": "年齡",
    "Height": "身高",
    "Weight": "體重",
    "Bust": "胸圍",
    "Open to BDSM": "是否開放 BDSM",
    "Open to unprotected sex after client’s health check":
      "是否開放在客戶健康檢查後進行無保護性行為",
    "Internal Ejaculation": "內射",
    "Oral Sex": "口交",
    "Living Together": "同居",
    "Overnight Stays": "過夜留宿",
    "Out-of-Town Services": "外地服務",
    "Absolutely Unacceptable": "絕對不可接受的項目",
    "Requirements for Sugar Daddy":
      "對 Sugar Daddy 的要求",
    "Reason for Seeking a Sugar Daddy":
      "尋求 Sugar Daddy 的原因",
    "Expected Compensation": "預期報酬",
    "Available Time Each Month": "每月可提供時間",
    "Threesomes": "三人性行為",
    "Foursomes": "四人性行為",
    "Countries/Regions Willing to Travel To":
      "願意前往的國家／地區",
    "None": "無",
    "Yes": "是",
    "No": "否",
    "Anytime": "隨時",
    "South Korea": "韓國",
    "Japan": "日本",
    "Singapore": "新加坡",
    "Malaysia": "馬來西亞",
    "United States": "美國",
    "United Kingdom": "英國",
  },

  zhCN: {
    "Occupation": "职业",
    "Unemployed": "失业",
    "Age": "年龄",
    "Height": "身高",
    "Weight": "体重",
    "Bust": "胸围",
    "Open to BDSM": "是否开放 BDSM",
    "Open to unprotected sex after client’s health check":
      "是否开放在客户健康检查后进行无保护性行为",
    "Internal Ejaculation": "体内射精",
    "Oral Sex": "口交",
    "Living Together": "同居",
    "Overnight Stays": "过夜留宿",
    "Out-of-Town Services": "异地服务",
    "Absolutely Unacceptable": "绝对不可接受的项目",
    "Requirements for Sugar Daddy":
      "对 Sugar Daddy 的要求",
    "Reason for Seeking a Sugar Daddy":
      "寻求 Sugar Daddy 的原因",
    "Expected Compensation": "预期报酬",
    "Available Time Each Month": "每月可提供时间",
    "Threesomes": "三人性行为",
    "Foursomes": "四人性行为",
    "Countries/Regions Willing to Travel To":
      "愿意前往的国家／地区",
    "None": "无",
    "Yes": "是",
    "No": "否",
    "Anytime": "随时",
    "South Korea": "韩国",
    "Japan": "日本",
    "Singapore": "新加坡",
    "Malaysia": "马来西亚",
    "United States": "美国",
    "United Kingdom": "英国",
  },

  ja: {
    "Occupation": "職業",
    "Unemployed": "無職",
    "Age": "年齢",
    "Height": "身長",
    "Weight": "体重",
    "Bust": "バスト",
    "Open to BDSM": "BDSMに対応可能",
    "Open to unprotected sex after client’s health check":
      "クライアントの健康チェック後の無防備な性行為に対応可能",
    "Internal Ejaculation": "膣内射精",
    "Oral Sex": "オーラルセックス",
    "Living Together": "同居",
    "Overnight Stays": "宿泊",
    "Out-of-Town Services": "遠方へのサービス",
    "Absolutely Unacceptable": "絶対に受け入れられない項目",
    "Requirements for Sugar Daddy":
      "Sugar Daddyへの条件",
    "Reason for Seeking a Sugar Daddy":
      "Sugar Daddyを求める理由",
    "Expected Compensation": "希望報酬",
    "Available Time Each Month": "毎月対応可能な時間",
    "Threesomes": "3人での性行為",
    "Foursomes": "4人での性行為",
    "Countries/Regions Willing to Travel To":
      "対応可能な国・地域",
    "None": "なし",
    "Yes": "はい",
    "No": "いいえ",
    "Anytime": "いつでも",
    "South Korea": "韓国",
    "Japan": "日本",
    "Singapore": "シンガポール",
    "Malaysia": "マレーシア",
    "United States": "アメリカ合衆国",
    "United Kingdom": "イギリス",
  },

  ko: {
    "Occupation": "직업",
    "Unemployed": "무직",
    "Age": "나이",
    "Height": "신장",
    "Weight": "체중",
    "Bust": "가슴 사이즈",
    "Open to BDSM": "BDSM 가능 여부",
    "Open to unprotected sex after client’s health check":
      "고객의 건강검진 후 무보호 성관계 가능 여부",
    "Internal Ejaculation": "질내사정",
    "Oral Sex": "구강성교",
    "Living Together": "동거",
    "Overnight Stays": "숙박",
    "Out-of-Town Services": "타지역 서비스",
    "Absolutely Unacceptable": "절대 허용되지 않는 항목",
    "Requirements for Sugar Daddy":
      "Sugar Daddy에 대한 요구사항",
    "Reason for Seeking a Sugar Daddy":
      "Sugar Daddy를 찾는 이유",
    "Expected Compensation": "희망 보상",
    "Available Time Each Month": "매월 가능한 시간",
    "Threesomes": "쓰리썸",
    "Foursomes": "포썸",
    "Countries/Regions Willing to Travel To":
      "방문 가능한 국가／지역",
    "None": "없음",
    "Yes": "예",
    "No": "아니요",
    "Anytime": "언제든지",
    "South Korea": "한국",
    "Japan": "일본",
    "Singapore": "싱가포르",
    "Malaysia": "말레이시아",
    "United States": "미국",
    "United Kingdom": "영국",
  },
};

function extractNumbers(
  text: string
): string[] {
  return (
    text.match(
      /\d[\d,]*(?:\.\d+)?/g
    ) ?? []
  );
}

function extractMoney(
  text: string
): MoneyValue[] {
  const matches =
    text.match(
      /([$€£¥])\s?\d[\d,]*(?:\.\d+)?/g
    ) ?? [];

  return matches.map((value) => {
    const symbol =
      value.charAt(0) as MoneyValue["symbol"];

    const amount = value
      .slice(1)
      .replace(/\s/g, "");

    return {
      symbol,
      amount,
    };
  });
}

function normalizeNumber(
  value: string
): string {
  return value.replace(/,/g, "");
}

function hasCjk(
  text: string
): boolean {
  return /[\u4E00-\u9FFF]/.test(text);
}

function hasKana(
  text: string
): boolean {
  return /[\u3040-\u30FF]/.test(text);
}

function hasHangul(
  text: string
): boolean {
  return /[\uAC00-\uD7AF]/.test(text);
}

function hasLatin(
  text: string
): boolean {
  return /[A-Za-z]/.test(text);
}

function hasChineseCharacters(
  text: string
): boolean {
  return /[\u4E00-\u9FFF]/.test(text);
}

function hasEnglishWord(
  text: string
): boolean {
  return /\b(?:elegant|intelligent|warm|relaxed|memorable|experience|enjoys|beautiful|smart|friendly|comfortable|occupation|unemployed|height|weight|bust|oral|services|none|yes|no|anytime)\b/i.test(
    text
  );
}

function hasForbiddenKoreanMixedText(
  text: string
): boolean {
  /*
   * Korean may contain Latin characters for:
   *
   * BDSM
   * Sugar Daddy
   * USD
   * model codes
   *
   * But Chinese/Japanese CJK characters are not
   * allowed in ordinary Korean output.
   */
  return hasChineseCharacters(text);
}

function validateNumbers(
  source: string,
  translated: string
): ValidationResult {
  const sourceNumbers =
    extractNumbers(source).map(
      normalizeNumber
    );

  const translatedNumbers =
    extractNumbers(translated).map(
      normalizeNumber
    );

  for (
    const number of sourceNumbers
  ) {
    if (
      !translatedNumbers.includes(
        number
      )
    ) {
      return {
        ok: false,
        reason:
          `Missing source number: ${number}`,
      };
    }
  }

  return {
    ok: true,
  };
}

function getCurrencyEvidence(
  symbol: MoneyValue["symbol"],
  language: TranslationLanguage
): RegExp {
  switch (symbol) {
    case "$":
      if (
        language === "zhTW" ||
        language === "zhCN"
      ) {
        return /(?:美元|美金|USD|US\s*\$|US\s*dollars?)/i;
      }

      if (language === "ja") {
        return /(?:米ドル|USドル|USD|US\s*\$|ドル)/i;
      }

      if (language === "ko") {
        return /(?:미국\s*달러|미화|달러|USD|US\s*\$|US\s*달러)/i;
      }

      return /(?:\$|USD|US\s*dollars?)/i;

    case "€":
      if (
        language === "zhTW" ||
        language === "zhCN"
      ) {
        return /(?:歐元|欧元|EUR|€)/i;
      }

      if (language === "ja") {
        return /(?:ユーロ|EUR|€)/i;
      }

      if (language === "ko") {
        return /(?:유로|EUR|€)/i;
      }

      return /(?:€|EUR|euros?)/i;

    case "£":
      if (
        language === "zhTW" ||
        language === "zhCN"
      ) {
        return /(?:英鎊|英镑|GBP|£)/i;
      }

      if (language === "ja") {
        return /(?:英ポンド|ポンド|GBP|£)/i;
      }

      if (language === "ko") {
        return /(?:영국\s*파운드|파운드|GBP|£)/i;
      }

      return /(?:£|GBP|pounds?)/i;

    case "¥":
      if (
        language === "zhTW" ||
        language === "zhCN"
      ) {
        return /(?:日圓|日元|JPY|CNY|¥)/i;
      }

      if (language === "ja") {
        return /(?:円|日本円|JPY|¥)/i;
      }

      if (language === "ko") {
        return /(?:엔|엔화|일본\s*엔|JPY|¥)/i;
      }

      return /(?:¥|JPY|CNY|yen|yuan)/i;
  }
}

function validateMoney(
  language: TranslationLanguage,
  source: string,
  translated: string
): ValidationResult {
  const sourceMoney =
    extractMoney(source);

  if (
    sourceMoney.length === 0
  ) {
    return {
      ok: true,
    };
  }

  const translatedNumbers =
    extractNumbers(
      translated
    ).map(normalizeNumber);

  for (
    const money of sourceMoney
  ) {
    const amount =
      normalizeNumber(
        money.amount
      );

    if (
      !translatedNumbers.includes(
        amount
      )
    ) {
      return {
        ok: false,
        reason:
          `Missing source currency amount: ${money.symbol}${money.amount}`,
      };
    }

    const currencyPattern =
      getCurrencyEvidence(
        money.symbol,
        language
      );

    if (
      !currencyPattern.test(
        translated
      )
    ) {
      return {
        ok: false,
        reason:
          `Missing or changed currency for ${money.symbol}${money.amount}.`,
      };
    }
  }

  return {
    ok: true,
  };
}

function validateGlossaryTerms(
  language: TranslationLanguage,
  source: string,
  translated: string
): ValidationResult {
  /*
   * Sugar Daddy must remain the exact brand/relationship
   * terminology in all supported languages.
   */
  if (
    /\bSugar Daddy\b/i.test(source) &&
    !/\bSugar Daddy\b/i.test(
      translated
    )
  ) {
    return {
      ok: false,
      reason:
        "Sugar Daddy must remain as the protected term 'Sugar Daddy'.",
    };
  }

  /*
   * BDSM is an acronym and must remain unchanged.
   */
  if (
    /\bBDSM\b/i.test(source) &&
    !/\bBDSM\b/i.test(
      translated
    )
  ) {
    return {
      ok: false,
      reason:
        "BDSM acronym was changed or removed.",
    };
  }

  return {
    ok: true,
  };
}

function validateLanguage(
  language: TranslationLanguage,
  text: string
): ValidationResult {
  if (!text.trim()) {
    return {
      ok: false,
      reason:
        "Translation is empty.",
    };
  }

  if (
    language === "zhTW" ||
    language === "zhCN"
  ) {
    if (!hasCjk(text)) {
      return {
        ok: false,
        reason:
          "Chinese translation contains no CJK characters.",
      };
    }

    return {
      ok: true,
    };
  }

  if (language === "ja") {
    if (!hasKana(text)) {
      return {
        ok: false,
        reason:
          "Japanese translation contains no Kana.",
      };
    }

    if (
      hasEnglishWord(text)
    ) {
      return {
        ok: false,
        reason:
          "Japanese translation contains an untranslated ordinary English word.",
      };
    }

    return {
      ok: true,
    };
  }

  if (language === "ko") {
    if (!hasHangul(text)) {
      return {
        ok: false,
        reason:
          "Korean translation contains no Hangul.",
      };
    }

    if (
      hasForbiddenKoreanMixedText(
        text
      )
    ) {
      return {
        ok: false,
        reason:
          "Korean translation contains Chinese/Japanese characters.",
      };
    }

    if (
      hasEnglishWord(text)
    ) {
      return {
        ok: false,
        reason:
          "Korean translation contains an untranslated ordinary English word.",
      };
    }

    return {
      ok: true,
    };
  }

  return {
    ok: true,
  };
}

function validateTranslation(
  language: TranslationLanguage,
  source: string,
  translated: string
): ValidationResult {
  const languageResult =
    validateLanguage(
      language,
      translated
    );

  if (!languageResult.ok) {
    return languageResult;
  }

  const numberResult =
    validateNumbers(
      source,
      translated
    );

  if (!numberResult.ok) {
    return numberResult;
  }

  const moneyResult =
    validateMoney(
      language,
      source,
      translated
    );

  if (!moneyResult.ok) {
    return moneyResult;
  }

  const glossaryResult =
    validateGlossaryTerms(
      language,
      source,
      translated
    );

  if (!glossaryResult.ok) {
    return glossaryResult;
  }

  return {
    ok: true,
  };
}

function buildGlossary(
  language: TranslationLanguage
): string {
  const entries =
    GLOSSARY[language];

  return Object.entries(
    entries
  )
    .map(
      ([source, target]) =>
        `- "${source}" => "${target}"`
    )
    .join("\n");
}

function buildPrompt(
  language: TranslationLanguage,
  source: string
): string {
  const languageName =
    LANGUAGE_CONFIG[language]
      .name;

  const languageInstructions =
    language === "zhTW"
      ? `
Write natural native Traditional Chinese.
Use Traditional Chinese characters.
Do not use Simplified Chinese forms intentionally.
`
      : language === "zhCN"
        ? `
Write natural native Simplified Chinese.
Use Simplified Chinese characters.
Do not use Traditional Chinese forms intentionally.
`
        : language === "ja"
          ? `
Write natural native Japanese.
Use Hiragana and Katakana naturally.
Use normal Japanese terminology for structured profile fields.
Do not translate Japanese terminology literally from English.
Do not leave ordinary English adjectives or verbs untranslated.
The protected terms "Sugar Daddy", "BDSM", and currency codes may remain in Latin characters.
`
          : `
Write natural native Korean.
Use Hangul naturally.
Use standard Korean terminology for structured profile fields.
Do not translate Korean terminology literally from English.
Do not leave ordinary English adjectives or verbs untranslated.
Do not use Chinese or Japanese characters.
The protected terms "Sugar Daddy", "BDSM", and currency codes may remain in Latin characters.
`;

  return `
You are a professional native-level translator specializing in structured luxury profile information.

Translate the English source into ${languageName}.

IMPORTANT:
This is structured factual profile data, not creative writing.

STRICT RULES:

- Preserve every fact.
- Preserve every number exactly.
- Preserve every currency amount exactly.
- Preserve the original currency.
- Never convert currencies.
- Never change USD into JPY, CNY, KRW, EUR, GBP, or another currency.
- "$500" may naturally become "500美元", "500ドル", "500달러", etc., but the amount and currency must remain USD.
- Never invent facts.
- Never remove facts.
- Never add facts.
- Never reinterpret a field.
- Preserve the same number of information lines whenever possible.
- Preserve "-" as "-" when the source value is "-".
- Preserve "None" as the appropriate target-language equivalent of no/none.
- Preserve "Yes" and "No" as the appropriate target-language equivalents.
- Keep country names accurate.
- Keep medical, sexual, relationship, and service terminology semantically exact.
- Do not turn one service into another service.
- Do not turn "Internal Ejaculation" into another concept.
- Do not turn "Oral Sex" into "kissing", "speech", "conversation", or any unrelated meaning.
- Do not turn "Living Together" into "staying overnight".
- Do not turn "Overnight Stays" into "night service".
- Do not turn "Out-of-Town Services" into "foreign travel".
- Do not change "Threesomes" or "Foursomes" into generic groups.
- Keep "Sugar Daddy" exactly as "Sugar Daddy".
- Keep "BDSM" exactly as "BDSM".
- Do not transliterate "Sugar Daddy".
- Do not creatively rename structured profile fields.
- Return ONLY the translated text.
- Do not add explanations.
- Do not add commentary.
- Do not add quotation marks.
- Do not add labels before or after the translation.

LANGUAGE-SPECIFIC REQUIREMENTS:
${languageInstructions}

FIXED GLOSSARY:

${buildGlossary(language)}

Before returning the translation, silently verify:

1. Every source field is represented.
2. Every number is preserved.
3. Every monetary amount is preserved.
4. The currency has not changed.
5. "Sugar Daddy" remains exactly "Sugar Daddy".
6. "BDSM" remains exactly "BDSM".
7. Medical terminology remains medically accurate.
8. Sexual terminology remains semantically accurate.
9. The target language sounds native.
10. There are no accidental mixed-language words.
11. No facts were invented.

SOURCE:

${source}
`.trim();
}

async function requestTranslation(
  language: TranslationLanguage,
  source: string
): Promise<string> {
  const response =
    await fetch(
      OLLAMA_URL,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          stream: false,
          messages: [
            {
              role: "system",
              content:
                "You are a professional native-level translator specializing in structured factual profiles. Return only the translation.",
            },
            {
              role: "user",
              content:
                buildPrompt(
                  language,
                  source
                ),
            },
          ],
        }),
      }
    );

  if (!response.ok) {
    throw new Error(
      `Ollama HTTP ${response.status}: ${await response.text()}`
    );
  }

  const data =
    await response.json();

  const text =
    data?.message?.content;

  if (
    typeof text !== "string" ||
    !text.trim()
  ) {
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
  const cleanSource =
    source.trim();

  if (!cleanSource) {
    throw new Error(
      "Cannot translate an empty introduction."
    );
  }

  let lastValidationError =
    "Unknown validation error.";

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {
    const text =
      await requestTranslation(
        language,
        cleanSource
      );

    const validation =
      validateTranslation(
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
      validation.reason ??
      "Translation validation failed.";
  }

  throw new Error(
    `Translation validation failed for ${language} after ${maxAttempts} attempts: ${lastValidationError}`
  );
}
