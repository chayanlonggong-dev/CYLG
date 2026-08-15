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
 * 问 / 字段名：固定精准四语
 * key = 英文小写（normalize 后）
 */
const FIELD_LABELS: Record<
  string,
  Record<TranslationLanguage, string>
> = {
  // ===== 新模板 =====
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
    ja: "カップサイズ",
    ko: "컵 사이즈",
  },
  sm: {
    zhTW: "是否接受 SM",
    zhCN: "是否接受 SM",
    ja: "SMを受け入れるか",
    ko: "SM 가능 여부",
  },
  "unprotected sex after medical checkup": {
    zhTW: "體檢後是否接受無套",
    zhCN: "体检后是否接受无套",
    ja: "健診後のノープロテクションを受け入れるか",
    ko: "검진 후 무보호 가능 여부",
  },
  internal: {
    zhTW: "是否接受內射",
    zhCN: "是否接受内射",
    ja: "中出しを受け入れるか",
    ko: "질내사정 가능 여부",
  },
  oral: {
    zhTW: "是否接受口交",
    zhCN: "是否接受口交",
    ja: "オーラルを受け入れるか",
    ko: "오럴 가능 여부",
  },
  "living together": {
    zhTW: "是否接受同居",
    zhCN: "是否接受同居",
    ja: "同棲を受け入れるか",
    ko: "동거 가능 여부",
  },
  "overnight stays": {
    zhTW: "過夜",
    zhCN: "过夜",
    ja: "泊まり",
    ko: "숙박",
  },
  "out-of-town visits": {
    zhTW: "外地見面",
    zhCN: "外地见面",
    ja: "遠方での出会い",
    ko: "지방 만남",
  },
  "out of town visits": {
    zhTW: "外地見面",
    zhCN: "外地见面",
    ja: "遠方での出会い",
    ko: "지방 만남",
  },
  "absolute no-gos": {
    zhTW: "絕對禁止事項",
    zhCN: "绝对禁止事项",
    ja: "絶対禁止事項",
    ko: "절대 금지 사항",
  },
  "absolute no gos": {
    zhTW: "絕對禁止事項",
    zhCN: "绝对禁止事项",
    ja: "絶対禁止事項",
    ko: "절대 금지 사항",
  },
  "requirements for clients": {
    zhTW: "對金主的要求",
    zhCN: "对金主的要求",
    ja: "クライアントへの要望",
    ko: "고객에 대한 요구사항",
  },
  "reason for seeking a client": {
    zhTW: "尋找金主的原因",
    zhCN: "寻找金主的原因",
    ja: "クライアントを探す理由",
    ko: "고객을 찾는 이유",
  },
  "expected daily rate": {
    zhTW: "預期日薪",
    zhCN: "预期日薪",
    ja: "希望日給",
    ko: "희망 일급",
  },
  "number of days available per month": {
    zhTW: "每月可約天數",
    zhCN: "每月可约天数",
    ja: "月間可能日数",
    ko: "월간 가능 일수",
  },
  threesome: {
    zhTW: "3P",
    zhCN: "3P",
    ja: "3P",
    ko: "3P",
  },
  threesomes: {
    zhTW: "3P",
    zhCN: "3P",
    ja: "3P",
    ko: "3P",
  },
  foursome: {
    zhTW: "4P",
    zhCN: "4P",
    ja: "4P",
    ko: "4P",
  },
  foursomes: {
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

  // ===== Open to ... =====
  "open to sm": {
    zhTW: "是否接受 SM",
    zhCN: "是否接受 SM",
    ja: "SMを受け入れるか",
    ko: "SM 가능 여부",
  },
  "open to unprotected sex after a medical exam": {
    zhTW: "體檢後是否接受無套",
    zhCN: "体检后是否接受无套",
    ja: "健診後のノープロテクションを受け入れるか",
    ko: "검진 후 무보호 가능 여부",
  },
  "open to internal": {
    zhTW: "是否接受內射",
    zhCN: "是否接受内射",
    ja: "中出しを受け入れるか",
    ko: "질내사정 가능 여부",
  },
  "open to oral": {
    zhTW: "是否接受口交",
    zhCN: "是否接受口交",
    ja: "オーラルを受け入れるか",
    ko: "오럴 가능 여부",
  },
  "open to living together": {
    zhTW: "是否接受同居",
    zhCN: "是否接受同居",
    ja: "同棲を受け入れるか",
    ko: "동거 가능 여부",
  },
  "open to anal sex": {
    zhTW: "是否接受肛交",
    zhCN: "是否接受肛交",
    ja: "アナルを受け入れるか",
    ko: "애널 가능 여부",
  },

  // ===== 旧模板兼容 =====
  "does she accept sm": {
    zhTW: "是否接受 SM",
    zhCN: "是否接受 SM",
    ja: "SMを受け入れるか",
    ko: "SM 가능 여부",
  },
  "does she accept unprotected sex after a medical exam by the client": {
    zhTW: "體檢後是否接受無套",
    zhCN: "体检后是否接受无套",
    ja: "健診後のノープロテクションを受け入れるか",
    ko: "검진 후 무보호 가능 여부",
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
  "out-of-town meetings": {
    zhTW: "外地見面",
    zhCN: "外地见面",
    ja: "遠方での出会い",
    ko: "지방 만남",
  },
  "out of town meetings": {
    zhTW: "外地見面",
    zhCN: "外地见面",
    ja: "遠方での出会い",
    ko: "지방 만남",
  },
  "requirements for a sugar daddy": {
    zhTW: "對金主的要求",
    zhCN: "对金主的要求",
    ja: "クライアントへの要望",
    ko: "고객에 대한 요구사항",
  },
  "reason for seeking a sugar daddy": {
    zhTW: "尋找金主的原因",
    zhCN: "寻找金主的原因",
    ja: "クライアントを探す理由",
    ko: "고객을 찾는 이유",
  },
  location: {
    zhTW: "地點",
    zhCN: "地点",
    ja: "場所",
    ko: "위치",
  },
};

/** 模糊匹配：措辞略有不同也能命中 */
const FIELD_ALIASES: Array<{
  test: RegExp;
  key: string;
}> = [
  { test: /\boccupation\b|\bjob\b|\bwork\b/i, key: "occupation" },
  { test: /\bage\b/i, key: "age" },
  { test: /\bheight\b/i, key: "height" },
  { test: /\bweight\b/i, key: "weight" },
  { test: /bra\s*size|cup\s*size/i, key: "bra size" },
  { test: /\bsm\b|sadomasoch/i, key: "sm" },
  {
    test: /unprotected|no\s*condom|bareback|medical\s*(exam|checkup)/i,
    key: "unprotected sex after medical checkup",
  },
  { test: /\binternal\b|creampie/i, key: "internal" },
  { test: /\boral\b|blow\s*job/i, key: "oral" },
  { test: /living\s*together|cohabit|live\s*together/i, key: "living together" },
  { test: /overnight|stay\s*over|sleep\s*over/i, key: "overnight stays" },
  {
    test: /out[-\s]?of[-\s]?town|travel\s*meet/i,
    key: "out-of-town visits",
  },
  { test: /no[-\s]?gos?|absolute\s*no/i, key: "absolute no-gos" },
  {
    test: /requirements?\s+for\s+(clients?|sugar|sponsors?)/i,
    key: "requirements for clients",
  },
  {
    test: /reason\s+for\s+seeking|why\s+seeking/i,
    key: "reason for seeking a client",
  },
  { test: /daily\s*rate|expected\s*rate/i, key: "expected daily rate" },
  {
    test: /days?\s+available|per\s+month/i,
    key: "number of days available per month",
  },
  { test: /threesome|3\s*p\b/i, key: "threesome" },
  { test: /foursome|4\s*p\b/i, key: "foursome" },
  {
    test: /countries?\s+willing|travel\s+to/i,
    key: "countries willing to travel to",
  },
  { test: /\banal\b/i, key: "open to anal sex" },
];

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
  "n/a": {
    zhTW: "無",
    zhCN: "无",
    ja: "なし",
    ko: "없음",
  },
  na: {
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
  light: {
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
  "1,500 per day": {
    zhTW: "1,500 美元/天",
    zhCN: "1,500 美元/天",
    ja: "1,500 USD/日",
    ko: "1,500 USD/일",
  },
  "1500 per day": {
    zhTW: "1500 美元/天",
    zhCN: "1500 美元/天",
    ja: "1500 USD/日",
    ko: "1500 USD/일",
  },
  "1,500/day": {
    zhTW: "1,500 美元/天",
    zhCN: "1,500 美元/天",
    ja: "1,500 USD/日",
    ko: "1,500 USD/일",
  },
  "1500/day": {
    zhTW: "1500 美元/天",
    zhCN: "1500 美元/天",
    ja: "1500 USD/日",
    ko: "1500 USD/일",
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

function resolveFieldKey(key: string): string {
  const normalized = normalizeKey(key);

  if (FIELD_LABELS[normalized]) {
    return normalized;
  }

  for (const alias of FIELD_ALIASES) {
    if (alias.test.test(key)) {
      return alias.key;
    }
  }

  return normalized;
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

function looksLikeEnglish(text: string): boolean {
  const letters = text.replace(/[^A-Za-z]/g, "");
  return letters.length >= 3;
}

function translateLabel(
  key: string,
  language: TranslationLanguage
): string {
  const resolved = resolveFieldKey(key);
  const mapped = FIELD_LABELS[resolved];
  if (mapped) {
    return mapped[language];
  }
  return key;
}

function translateCountryList(
  value: string,
  language: TranslationLanguage
): string | null {
  const parts = value
    .split(/[,，、]/)
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

  if (/^[+]?\d[\d,]*(?:\.\d+)?$/.test(trimmed)) {
    return trimmed;
  }

  if (/^[A-Za-z]$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  const lower = trimmed.toLowerCase();

  if (VALUE_MAP[lower]) {
    return VALUE_MAP[lower][language];
  }

  if (PLACE_MAP[lower]) {
    return PLACE_MAP[lower][language];
  }

  // 1,500 per day / 1500 per day / 1,500/day
  const perDay = trimmed.match(
    /^([+]?\d[\d,]*(?:\.\d+)?)\s*(?:per\s*day|\/\s*day|\/day)$/i
  );
  if (perDay) {
    const amount = perDay[1];
    if (language === "zhTW" || language === "zhCN") {
      return `${amount} 美元/天`;
    }
    if (language === "ja") {
      return `${amount} USD/日`;
    }
    return `${amount} USD/일`;
  }

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
  value: string,
  mode: "label" | "value" = "value"
): Promise<string> {
  const languageName = LANGUAGE_CONFIG[language].name;

  const system =
    mode === "label"
      ? `You translate profile field labels into ${languageName}.
Return ONLY the translated field name.
No quotes. No explanation. No colon.
Keep SM / 3P / 4P style terms natural.`
      : `You translate short escort-profile answers into natural ${languageName}.
Return ONLY the translation.
No quotes. No explanation.
Keep numbers unchanged.
Money must keep US dollar meaning (美元 / USD). Never bare 元 / 円 / 원.
Do NOT leave ordinary English words untranslated.`;

  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      stream: false,
      options: {
        temperature: 0.05,
        top_p: 0.85,
      },
      messages: [
        {
          role: "system",
          content: system,
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
      `Ollama returned an empty ${mode} translation for ${language}.`
    );
  }

  return text
    .trim()
    .replace(/^["'「『]|["'」』]$/g, "")
    .replace(/[:：]\s*$/g, "")
    .trim();
}

async function translateLabelSafe(
  key: string,
  language: TranslationLanguage
): Promise<string> {
  const direct = translateLabel(key, language);

  // 已命中词典
  if (direct !== key) {
    return direct;
  }

  // 没命中，但看起来还是英文 → 用 AI 翻字段名
  if (looksLikeEnglish(key)) {
    try {
      return await ollamaTranslateShort(language, key, "label");
    } catch {
      return key;
    }
  }

  return key;
}

async function translateValue(
  value: string,
  language: TranslationLanguage
): Promise<string> {
  const deterministic = translateValueDeterministic(value, language);
  if (deterministic !== null) {
    return deterministic;
  }

  try {
    return await ollamaTranslateShort(language, value, "value");
  } catch {
    return value;
  }
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

    const label = await translateLabelSafe(line.key, language);
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
        temperature: 0.15,
        top_p: 0.9,
      },
      messages: [
        {
          role: "system",
          content: `You are a professional native translator into ${languageName}.
Return only the translation.
Keep numbers unchanged.
Keep USD meaning (美元 / USD).
Do not leave ordinary English words untranslated.`,
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