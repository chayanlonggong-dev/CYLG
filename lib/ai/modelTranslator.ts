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

const LANGUAGE_CONFIG: Record<
  TranslationLanguage,
  { name: string }
> = {
  zhTW: { name: "Traditional Chinese" },
  zhCN: { name: "Simplified Chinese" },
  ja: { name: "Japanese" },
  ko: { name: "Korean" },
};

/**
 * 问 / 字段名：固定精准四语，不交给 AI
 * key = 英文小写（normalize 后）
 */
const FIELD_LABELS: Record<
  string,
  Record<TranslationLanguage, string>
> = {
  // ===== 你的样本字段 =====
  occupation: {
    zhTW: "職業",
    zhCN: "职业",
    ja: "職業",
    ko: "직업",
  },
  age: {
    zhTW: "年齡",
    zhCN: "年龄",
    ja: "年齢",
    ko: "나이",
  },
  height: {
    zhTW: "身高",
    zhCN: "身高",
    ja: "身長",
    ko: "키",
  },
  weight: {
    zhTW: "體重",
    zhCN: "体重",
    ja: "体重",
    ko: "몸무게",
  },
  "bra size": {
    zhTW: "罩杯",
    zhCN: "罩杯",
    ja: "ブラサイズ",
    ko: "브라 사이즈",
  },
  "does she accept sm": {
    zhTW: "是否接受 SM",
    zhCN: "是否接受 SM",
    ja: "SMを受け入れるか",
    ko: "SM 가능 여부",
  },
  "does she accept unprotected sex after a medical exam by the client": {
    zhTW: "客戶體檢後是否接受無套",
    zhCN: "客户体检后是否接受无套",
    ja: "お客様指定の健診後にノープロテクションを受け入れるか",
    ko: "고객 지정 검진 후 무보호 가능 여부",
  },
  "does she accept anal sex": {
    zhTW: "是否接受肛交",
    zhCN: "是否接受肛交",
    ja: "アナルを受け入れるか",
    ko: "애널 가능 여부",
  },
  "does she accept oral sex": {
    zhTW: "是否接受口交",
    zhCN: "是否接受口交",
    ja: "オーラルを受け入れるか",
    ko: "오럴 가능 여부",
  },
  "does she accept living together": {
    zhTW: "是否接受同居",
    zhCN: "是否接受同居",
    ja: "同棲を受け入れるか",
    ko: "동거 가능 여부",
  },
  "overnight stays": {
    zhTW: "過夜",
    zhCN: "过夜",
    ja: "宿泊",
    ko: "숙박",
  },
  "out-of-town meetings": {
    zhTW: "外地見面",
    zhCN: "外地见面",
    ja: "地方での会合",
    ko: "지방 만남",
  },
  "out of town meetings": {
    zhTW: "外地見面",
    zhCN: "外地见面",
    ja: "地方での会合",
    ko: "지방 만남",
  },
  "absolute no-gos": {
    zhTW: "絕對禁止事項",
    zhCN: "绝对禁止事项",
    ja: "絶対不可事項",
    ko: "절대 불가 사항",
  },
  "absolute no gos": {
    zhTW: "絕對禁止事項",
    zhCN: "绝对禁止事项",
    ja: "絶対不可事項",
    ko: "절대 불가 사항",
  },
  "requirements for a sugar daddy": {
    zhTW: "對金主的要求",
    zhCN: "对金主的要求",
    ja: "スポンサーへの条件",
    ko: "스폰서에 대한 요구사항",
  },
  "reason for seeking a sugar daddy": {
    zhTW: "尋找金主的原因",
    zhCN: "寻找金主的原因",
    ja: "スポンサーを探す理由",
    ko: "스폰서를 찾는 이유",
  },
  "expected daily rate": {
    zhTW: "預期日薪",
    zhCN: "预期日薪",
    ja: "希望日当",
    ko: "예상 일당",
  },
  "number of days available per month": {
    zhTW: "每月可約天數",
    zhCN: "每月可约天数",
    ja: "月間対応可能日数",
    ko: "월 가능 일수",
  },
  threesomes: {
    zhTW: "3P",
    zhCN: "3P",
    ja: "3P",
    ko: "3P",
  },
  threesome: {
    zhTW: "3P",
    zhCN: "3P",
    ja: "3P",
    ko: "3P",
  },
  foursomes: {
    zhTW: "4P",
    zhCN: "4P",
    ja: "4P",
    ko: "4P",
  },
  foursome: {
    zhTW: "4P",
    zhCN: "4P",
    ja: "4P",
    ko: "4P",
  },
  "countries willing to travel to": {
    zhTW: "願意前往的國家",
    zhCN: "愿意前往的国家",
    ja: "渡航可能な国",
    ko: "방문 가능 국가",
  },

  // ===== 旧模板兼容 =====
  location: {
    zhTW: "地點",
    zhCN: "地点",
    ja: "場所",
    ko: "위치",
  },
  sm: {
    zhTW: "SM",
    zhCN: "SM",
    ja: "SM",
    ko: "SM",
  },
  "unprotected sex after medical checkup": {
    zhTW: "體檢後無套",
    zhCN: "体检后无套",
    ja: "健診後のノープロテクション",
    ko: "검진 후 무보호",
  },
  internal: {
    zhTW: "內射",
    zhCN: "内射",
    ja: "中出し",
    ko: "질내사정",
  },
  oral: {
    zhTW: "口交",
    zhCN: "口交",
    ja: "オーラル",
    ko: "오럴",
  },
  "living together": {
    zhTW: "同居",
    zhCN: "同居",
    ja: "同棲",
    ko: "동거",
  },
  "out-of-town visits": {
    zhTW: "外地出差",
    zhCN: "外地出差",
    ja: "地方出張",
    ko: "지방 출장",
  },
  "out of town visits": {
    zhTW: "外地出差",
    zhCN: "外地出差",
    ja: "地方出張",
    ko: "지방 출장",
  },
  "requirements for clients": {
    zhTW: "對客人要求",
    zhCN: "对客人要求",
    ja: "お客様への条件",
    ko: "고객 요구사항",
  },
  "reason for seeking a client": {
    zhTW: "尋找客人原因",
    zhCN: "寻找客人原因",
    ja: "お客様を探す理由",
    ko: "고객을 찾는 이유",
  },
};

/** 答：Yes / No / None / 固定短句 */
const VALUE_MAP: Record<
  string,
  Record<TranslationLanguage, string>
> = {
  yes: {
    zhTW: "是",
    zhCN: "是",
    ja: "はい",
    ko: "예",
  },
  no: {
    zhTW: "否",
    zhCN: "否",
    ja: "いいえ",
    ko: "아니오",
  },
  none: {
    zhTW: "無",
    zhCN: "无",
    ja: "なし",
    ko: "없음",
  },
  "need money": {
    zhTW: "需要錢",
    zhCN: "需要钱",
    ja: "お金が必要",
    ko: "돈이 필요함",
  },
  "must be booked in advance": {
    zhTW: "必須提前預約",
    zhCN: "必须提前预约",
    ja: "要事前予約",
    ko: "사전 예약 필수",
  },
  mild: {
    zhTW: "輕度",
    zhCN: "轻度",
    ja: "軽度",
    ko: "경도",
  },
  medium: {
    zhTW: "中等",
    zhCN: "中等",
    ja: "中程度",
    ko: "중등도",
  },
  moderate: {
    zhTW: "中等",
    zhCN: "中等",
    ja: "中程度",
    ko: "중등도",
  },
  strong: {
    zhTW: "重度",
    zhCN: "重度",
    ja: "重度",
    ko: "고강도",
  },
  hard: {
    zhTW: "重度",
    zhCN: "重度",
    ja: "重度",
    ko: "고강도",
  },
};

const PLACE_MAP: Record<
  string,
  Record<TranslationLanguage, string>
> = {
  hangzhou: {
    zhTW: "杭州",
    zhCN: "杭州",
    ja: "杭州",
    ko: "항저우",
  },
  "south korea": {
    zhTW: "韓國",
    zhCN: "韩国",
    ja: "韓国",
    ko: "한국",
  },
  korea: {
    zhTW: "韓國",
    zhCN: "韩国",
    ja: "韓国",
    ko: "한국",
  },
  japan: {
    zhTW: "日本",
    zhCN: "日本",
    ja: "日本",
    ko: "일본",
  },
  singapore: {
    zhTW: "新加坡",
    zhCN: "新加坡",
    ja: "シンガポール",
    ko: "싱가포르",
  },
  malaysia: {
    zhTW: "馬來西亞",
    zhCN: "马来西亚",
    ja: "マレーシア",
    ko: "말레이시아",
  },
  "the united states": {
    zhTW: "美國",
    zhCN: "美国",
    ja: "アメリカ",
    ko: "미국",
  },
  "united states": {
    zhTW: "美國",
    zhCN: "美国",
    ja: "アメリカ",
    ko: "미국",
  },
  usa: {
    zhTW: "美國",
    zhCN: "美国",
    ja: "アメリカ",
    ko: "미국",
  },
  "the united kingdom": {
    zhTW: "英國",
    zhCN: "英国",
    ja: "イギリス",
    ko: "영국",
  },
  "united kingdom": {
    zhTW: "英國",
    zhCN: "英国",
    ja: "イギリス",
    ko: "영국",
  },
  uk: {
    zhTW: "英國",
    zhCN: "英国",
    ja: "イギリス",
    ko: "영국",
  },
  china: {
    zhTW: "中國",
    zhCN: "中国",
    ja: "中国",
    ko: "중국",
  },
};

interface FieldLine {
  raw: string;
  key: string;
  value: string;
  hasColon: boolean;
}

function normalizeKey(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[?？]/g, "");
}

function parseFieldLines(source: string): FieldLine[] {
  return source.split(/\r?\n/).map((raw) => {
    const idx = raw.indexOf(":");
    if (idx === -1) {
      return {
        raw,
        key: "",
        value: raw,
        hasColon: false,
      };
    }
    return {
      raw,
      key: raw.slice(0, idx).trim(),
      value: raw.slice(idx + 1).trim(),
      hasColon: true,
    };
  });
}

function isStructuredSource(source: string): boolean {
  const lines = parseFieldLines(source).filter((l) => l.raw.trim());
  if (lines.length < 3) return false;
  const colonLines = lines.filter((l) => l.hasColon).length;
  return colonLines / lines.length >= 0.5;
}

function translateLabel(
  key: string,
  language: TranslationLanguage
): string {
  const mapped = FIELD_LABELS[normalizeKey(key)];
  return mapped ? mapped[language] : key;
}

function translateCountryList(
  value: string,
  language: TranslationLanguage
): string | null {
  const parts = value
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length < 2) return null;

  const translated: string[] = [];
  for (const part of parts) {
    const place = PLACE_MAP[part.toLowerCase()];
    if (!place) return null;
    translated.push(place[language]);
  }

  return translated.join(language === "ko" ? ", " : "、");
}

function translateValueDeterministic(
  value: string,
  language: TranslationLanguage
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "";

  // 数字：22 / +300 / 1500
  if (/^[+]?\d[\d,]*(?:\.\d+)?$/.test(trimmed)) {
    return trimmed;
  }

  // 罩杯字母：C / G
  if (/^[A-Za-z]$/.test(trimmed)) {
    return trimmed;
  }

  const lower = trimmed.toLowerCase();

  if (VALUE_MAP[lower]) {
    return VALUE_MAP[lower][language];
  }

  if (PLACE_MAP[lower]) {
    return PLACE_MAP[lower][language];
  }

  // 1500 USD / $1500
  const usdSuffix = trimmed.match(
    /^([+]?\d[\d,]*(?:\.\d+)?)\s*(?:USD|US\$|\$|dollars?)$/i
  );
  if (usdSuffix) {
    const amount = usdSuffix[1];
    if (language === "zhTW" || language === "zhCN") {
      return `${amount} 美元`;
    }
    return `${amount} USD`;
  }

  const usdPrefix = trimmed.match(
    /^(?:USD|US\$|\$)\s*([+]?\d[\d,]*(?:\.\d+)?)$/i
  );
  if (usdPrefix) {
    const amount = usdPrefix[1];
    if (language === "zhTW" || language === "zhCN") {
      return `${amount} 美元`;
    }
    return `${amount} USD`;
  }

  const countries = translateCountryList(trimmed, language);
  if (countries !== null) {
    return countries;
  }

  return null;
}

async function ollamaTranslateShort(
  language: TranslationLanguage,
  value: string
): Promise<string> {
  const languageName = LANGUAGE_CONFIG[language].name;

  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      stream: false,
      options: {
        temperature: 0.1,
        top_p: 0.9,
      },
      messages: [
        {
          role: "system",
          content: `Translate short answer phrases into ${languageName} only. Return only the translation. No quotes. No explanation. Keep numbers unchanged. If money/USD, keep US dollar meaning (美元/美金/USD), never bare 元/円/원.`,
        },
        {
          role: "user",
          content: `Translate into ${languageName}:\n${value}`,
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
      `Ollama returned an empty value translation for ${language}.`
    );
  }

  return text
    .trim()
    .replace(/^["'「『]|["'」』]$/g, "")
    .trim();
}

async function translateValue(
  value: string,
  language: TranslationLanguage
): Promise<string> {
  const deterministic = translateValueDeterministic(value, language);
  if (deterministic !== null) {
    return deterministic;
  }
  // 仅职业等少数自由文本才走 AI
  return ollamaTranslateShort(language, value);
}

async function translateStructured(
  language: TranslationLanguage,
  source: string
): Promise<string> {
  const lines = parseFieldLines(source);
  const output: string[] = [];

  for (const line of lines) {
    if (!line.raw.trim()) {
      output.push("");
      continue;
    }

    if (!line.hasColon) {
      output.push(await translateValue(line.value, language));
      continue;
    }

    const label = translateLabel(line.key, language);
    const translatedValue = await translateValue(line.value, language);

    if (translatedValue === "") {
      output.push(`${label}:`);
    } else {
      output.push(`${label}: ${translatedValue}`);
    }
  }

  return output.join("\n");
}

async function translateFreeText(
  language: TranslationLanguage,
  source: string
): Promise<string> {
  const languageName = LANGUAGE_CONFIG[language].name;

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
          content: `You are a professional translator into ${languageName}. Return only the translation. Keep numbers and USD meaning unchanged.`,
        },
        {
          role: "user",
          content: `Translate into ${languageName}:\n\n${source}`,
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

  return text.trim();
}

export async function translateIntroduction(
  language: TranslationLanguage,
  source: string
): Promise<TranslationResult> {
  const cleanSource = source.trim();

  if (!cleanSource) {
    throw new Error("Cannot translate an empty introduction.");
  }

  const text = isStructuredSource(cleanSource)
    ? await translateStructured(language, cleanSource)
    : await translateFreeText(language, cleanSource);

  if (!text.trim()) {
    throw new Error(
      `Translation result was empty for ${language}.`
    );
  }

  return {
    language,
    text,
  };
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
      const result = await translateIntroduction(language, source);
      translations[language] = result.text;
    } catch (error) {
      errors[language] =
        error instanceof Error ? error.message : String(error);
    }
  }

  return {
    translations,
    errors,
  };
}