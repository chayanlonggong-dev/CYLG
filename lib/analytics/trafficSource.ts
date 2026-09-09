/**
 * Unified Traffic Source Classification
 *
 * Priority:
 *   1. UTM / campaign / click-id
 *   2. document.referrer / HTTP Referer hostname
 *   3. In-app user-agent
 *   4. Direct
 */

export type TrafficCategory =
  | "Search"
  | "Social"
  | "Referral"
  | "Direct"
  | "Campaign";

export type ClassifiedTrafficSource = {
  category: TrafficCategory;
  source: string;
  rawReferrer: string;
  rawSource: string;
  rawMedium: string;
  rawCampaign: string;
};

type ClassifyInput = {
  referrer?: string | null;
  query?: string | null;
  userAgent?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
};

const OWN_HOST_FRAGMENTS = [
  "chayanlonggong.",
  "cylg-production.vercel.app",
  "localhost",
  "127.0.0.1",
];

type Rule = {
  category: TrafficCategory;
  source: string;
  hosts?: string[];
  utm?: string[];
  queryHints?: string[];
  ua?: RegExp[];
};

const RULES: Rule[] = [
  {
    category: "Search",
    source: "Google",
    hosts: ["google.", "googleadservices.", "googleads.", "goo.gl", "youtube.googleapis."],
    utm: ["google", "googleads", "adwords", "youtube-search"],
    queryHints: ["gclid=", "gbraid=", "wbraid="],
  },
  {
    category: "Search",
    source: "Bing",
    hosts: ["bing.", "bingj.", "msn."],
    utm: ["bing", "msn"],
    queryHints: ["msclkid="],
  },
  {
    category: "Search",
    source: "Yahoo",
    hosts: ["yahoo.", "search.yahoo."],
    utm: ["yahoo"],
  },
  {
    category: "Search",
    source: "DuckDuckGo",
    hosts: ["duckduckgo."],
    utm: ["duckduckgo", "ddg"],
  },
  {
    category: "Search",
    source: "Baidu",
    hosts: ["baidu.", "baiducontent."],
    utm: ["baidu"],
  },
  {
    category: "Search",
    source: "Yandex",
    hosts: ["yandex.", "ya.ru"],
    utm: ["yandex"],
  },
  {
    category: "Social",
    source: "Instagram",
    hosts: ["instagram.", "instagr.am", "ig.me"],
    utm: ["instagram", "ig"],
    queryHints: ["igshid=", "igsh="],
    ua: [/instagram/i],
  },
  {
    category: "Social",
    source: "Facebook",
    hosts: ["facebook.", "fb.com", "fb.me", "fb.watch", "messenger.com"],
    utm: ["facebook", "fb", "meta"],
    queryHints: ["fbclid="],
    ua: [/fban|fbav|fb_iab|fb4a|fbsv/i],
  },
  {
    category: "Social",
    source: "Threads",
    hosts: ["threads.net", "threads.com"],
    utm: ["threads"],
  },
  {
    category: "Social",
    source: "TikTok",
    hosts: ["tiktok.", "vm.tiktok.", "vt.tiktok."],
    utm: ["tiktok"],
    queryHints: ["ttclid="],
    ua: [/tiktok/i, /musical_ly/i, /bytedance/i],
  },
  {
    category: "Social",
    source: "X / Twitter",
    hosts: ["twitter.", "x.com", "t.co"],
    utm: ["twitter", "x"],
  },
  {
    category: "Social",
    source: "LinkedIn",
    hosts: ["linkedin.", "lnkd.in"],
    utm: ["linkedin"],
  },
  {
    category: "Social",
    source: "Pinterest",
    hosts: ["pinterest.", "pin.it"],
    utm: ["pinterest"],
  },
  {
    category: "Social",
    source: "Reddit",
    hosts: ["reddit.", "redd.it"],
    utm: ["reddit"],
  },
  {
    category: "Social",
    source: "YouTube",
    hosts: ["youtube.", "youtu.be", "ytimg."],
    utm: ["youtube", "yt"],
  },
  {
    category: "Social",
    source: "WhatsApp",
    hosts: ["whatsapp.", "wa.me", "api.whatsapp."],
    utm: ["whatsapp"],
    ua: [/whatsapp/i],
  },
  {
    category: "Social",
    source: "Telegram",
    hosts: ["telegram.", "t.me"],
    utm: ["telegram"],
  },
  {
    category: "Social",
    source: "LINE",
    hosts: ["line.me", "line.naver."],
    utm: ["line"],
    ua: [/\bline\//i],
  },
  {
    category: "Social",
    source: "WeChat",
    hosts: ["wechat.", "weixin."],
    utm: ["wechat", "weixin"],
    ua: [/micromessenger/i],
  },
  {
    category: "Social",
    source: "Signal",
    hosts: ["signal.org"],
    utm: ["signal"],
  },
];

const KNOWN_SOURCE_LOOKUP: Record<
  string,
  { category: TrafficCategory; source: string }
> = {};

for (const rule of RULES) {
  KNOWN_SOURCE_LOOKUP[rule.source.toLowerCase()] = {
    category: rule.category,
    source: rule.source,
  };
  for (const u of rule.utm || []) {
    KNOWN_SOURCE_LOOKUP[u.toLowerCase()] = {
      category: rule.category,
      source: rule.source,
    };
  }
}
KNOWN_SOURCE_LOOKUP["x / twitter"] = { category: "Social", source: "X / Twitter" };
KNOWN_SOURCE_LOOKUP["x"] = { category: "Social", source: "X / Twitter" };
KNOWN_SOURCE_LOOKUP["twitter"] = { category: "Social", source: "X / Twitter" };
KNOWN_SOURCE_LOOKUP["direct"] = { category: "Direct", source: "Direct" };
KNOWN_SOURCE_LOOKUP["other"] = { category: "Referral", source: "Referral" };
KNOWN_SOURCE_LOOKUP["referral"] = { category: "Referral", source: "Referral" };
KNOWN_SOURCE_LOOKUP["social"] = { category: "Social", source: "Social" };
KNOWN_SOURCE_LOOKUP["search"] = { category: "Search", source: "Search" };

function parseQuery(query: string): URLSearchParams {
  const raw = (query || "").trim();
  if (!raw) return new URLSearchParams();
  try {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return new URL(raw).searchParams;
    }
  } catch {
    /* fall through */
  }
  const q = raw.startsWith("?") ? raw.slice(1) : raw;
  return new URLSearchParams(q);
}

function extractHost(referrer: string): string {
  const raw = (referrer || "").trim();
  if (!raw) return "";
  try {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return new URL(raw).hostname.toLowerCase();
    }
  } catch {
    /* ignore */
  }
  const noPath = raw.split("/")[0].split("?")[0].toLowerCase();
  if (noPath.includes(".") && !noPath.includes(" ")) return noPath;
  return "";
}

function stripWww(host: string): string {
  return host.replace(/^www\./, "");
}

function isOwnHost(hostOrUrl: string): boolean {
  const v = (hostOrUrl || "").toLowerCase();
  return OWN_HOST_FRAGMENTS.some((f) => v.includes(f));
}

function matchRuleByHost(host: string): Rule | null {
  if (!host) return null;
  const h = host.toLowerCase();
  for (const rule of RULES) {
    for (const frag of rule.hosts || []) {
      if (h.includes(frag)) return rule;
    }
  }
  return null;
}

function matchRuleByUtm(utmSource: string, queryLower: string): Rule | null {
  const s = utmSource.toLowerCase();
  for (const rule of RULES) {
    if ((rule.utm || []).includes(s)) return rule;
    for (const hint of rule.queryHints || []) {
      if (queryLower.includes(hint)) return rule;
    }
  }
  return null;
}

function matchRuleByUa(ua: string): Rule | null {
  if (!ua) return null;
  for (const rule of RULES) {
    for (const re of rule.ua || []) {
      if (re.test(ua)) return rule;
    }
  }
  return null;
}

function result(
  category: TrafficCategory,
  source: string,
  raw: { referrer: string; source: string; medium: string; campaign: string }
): ClassifiedTrafficSource {
  return {
    category,
    source,
    rawReferrer: raw.referrer,
    rawSource: raw.source,
    rawMedium: raw.medium,
    rawCampaign: raw.campaign,
  };
}

export function classifyTrafficSource(
  input: ClassifyInput = {}
): ClassifiedTrafficSource {
  const rawReferrer = (input.referrer || "").trim();
  const rawQuery = (input.query || "").trim();
  const ua = input.userAgent || "";

  const params = parseQuery(rawQuery || rawReferrer);
  const utmSource = (input.utmSource || params.get("utm_source") || "").trim();
  const utmMedium = (input.utmMedium || params.get("utm_medium") || "").trim();
  const utmCampaign = (input.utmCampaign || params.get("utm_campaign") || "").trim();

  const raw = {
    referrer: rawReferrer,
    source: utmSource,
    medium: utmMedium,
    campaign: utmCampaign,
  };

  const queryLower = `${rawQuery} ${rawReferrer}`.toLowerCase();
  const storedLabel = KNOWN_SOURCE_LOOKUP[rawReferrer.toLowerCase()];

  if (storedLabel && !utmSource && !params.get("gclid") && !params.get("fbclid")) {
    if (storedLabel.source !== "Referral") {
      return result(storedLabel.category, storedLabel.source, raw);
    }
  }

  if (
    utmSource ||
    /gclid=|gbraid=|wbraid=|fbclid=|ttclid=|msclkid=|igshid=|igsh=/.test(queryLower)
  ) {
    const rule = matchRuleByUtm(utmSource, queryLower);
    if (rule) return result(rule.category, rule.source, raw);
    if (utmSource) {
      const medium = utmMedium.toLowerCase();
      const category: TrafficCategory =
        medium.includes("cpc") ||
        medium.includes("ppc") ||
        medium.includes("paid") ||
        medium.includes("ads")
          ? "Campaign"
          : medium.includes("social")
            ? "Social"
            : medium.includes("organic") || medium.includes("search")
              ? "Search"
              : "Referral";
      const pretty =
        utmSource.charAt(0).toUpperCase() + utmSource.slice(1).toLowerCase();
      return result(category, pretty, raw);
    }
  }

  const host = extractHost(rawReferrer);
  if (host && !isOwnHost(host) && !isOwnHost(rawReferrer)) {
    const rule = matchRuleByHost(host);
    if (rule) return result(rule.category, rule.source, raw);
    return result("Referral", stripWww(host), raw);
  }

  if (!host && rawReferrer && !storedLabel && rawReferrer.includes(".")) {
    const rule = matchRuleByHost(rawReferrer.toLowerCase());
    if (rule) return result(rule.category, rule.source, raw);
    if (!isOwnHost(rawReferrer)) {
      return result(
        "Referral",
        stripWww(rawReferrer.split("/")[0].toLowerCase()),
        raw
      );
    }
  }

  const uaRule = matchRuleByUa(ua);
  if (uaRule) return result(uaRule.category, uaRule.source, raw);

  if (isOwnHost(rawReferrer) || isOwnHost(host)) {
    return result("Direct", "Direct", raw);
  }

  if (storedLabel) {
    return result(storedLabel.category, storedLabel.source, raw);
  }

  return result("Direct", "Direct", raw);
}

export function trafficSourceLabel(input: ClassifyInput): string {
  return classifyTrafficSource(input).source;
}

export function trafficSourceCategory(input: ClassifyInput): TrafficCategory {
  return classifyTrafficSource(input).category;
}