import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { classifyTrafficSource } from "@/lib/analytics/trafficSource";

const COUNTRY_MAP: Record<string, string> = {
  US: "United States",
  TH: "Thailand",
  MY: "Malaysia",
  SG: "Singapore",
  JP: "Japan",
  KR: "South Korea",
  CN: "China",
  TW: "Taiwan",
  HK: "Hong Kong",
  VN: "Vietnam",
  ID: "Indonesia",
  PH: "Philippines",
  IN: "India",
  GB: "United Kingdom",
  UK: "United Kingdom",
  FR: "France",
  DE: "Germany",
  IE: "Ireland",
  CA: "Canada",
  AU: "Australia",
  SE: "Sweden",
  NL: "Netherlands",
  BE: "Belgium",
  CH: "Switzerland",
  ES: "Spain",
  IT: "Italy",
  BR: "Brazil",
  MX: "Mexico",
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
  RU: "Russia",
  PL: "Poland",
  NZ: "New Zealand",
  XX: "Unknown",
  T1: "Unknown",
};

function normalizeCountry(code: string | null | undefined): string {
  if (!code) return "Unknown";
  const c = code.trim().toUpperCase();
  if (!c || c === "XX" || c === "T1" || c === "UNKNOWN") return "Unknown";
  return COUNTRY_MAP[c] || code.trim();
}

function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  const cleaned = ip.split(",")[0].trim();
  if (
    cleaned === "127.0.0.1" ||
    cleaned === "::1" ||
    cleaned === "localhost" ||
    cleaned === "0.0.0.0" ||
    cleaned === "::"
  ) {
    return true;
  }
  if (
    cleaned.startsWith("10.") ||
    cleaned.startsWith("192.168.") ||
    cleaned.startsWith("169.254.")
  ) {
    return true;
  }
  const m = cleaned.match(/^172\.(\d+)\./);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 16 && n <= 31) return true;
  }
  return false;
}

function detectBrowser(userAgent: string): string {
  const ua = userAgent || "";

  if (/FBAN|FBAV|FB_IAB|FB4A/i.test(ua)) return "Facebook App";
  if (/Instagram/i.test(ua)) return "Instagram App";
  if (/Line\//i.test(ua)) return "LINE App";
  if (/WhatsApp/i.test(ua)) return "WhatsApp App";
  if (/Edg\/([\d.]+)/i.test(ua)) return "Edge";
  if (/OPR\/([\d.]+)/i.test(ua) || /Opera/i.test(ua)) return "Opera";
  if (/Brave/i.test(ua)) return "Brave";
  if (/SamsungBrowser\/([\d.]+)/i.test(ua)) return "Samsung Internet";
  if (/DuckDuckGo/i.test(ua)) return "DuckDuckGo";
  if (/Arc\//i.test(ua)) return "Arc";
  if (/Firefox\/([\d.]+)/i.test(ua) || /FxiOS/i.test(ua)) return "Firefox";
  if (/CriOS/i.test(ua)) return "Chrome";
  if (/Chrome\/([\d.]+)/i.test(ua) && !/Edg|OPR|Brave/i.test(ua)) {
    return "Chrome";
  }
  if (
    /Version\/([\d.]+).*Safari/i.test(ua) ||
    (/Safari/i.test(ua) && !/Chrome|CriOS/i.test(ua))
  ) {
    return "Safari";
  }
  return "Unknown";
}

function detectDevice(userAgent: string): string {
  const ua = (userAgent || "").toLowerCase();

  if (ua.includes("iphone") || ua.includes("ipod")) return "Mobile";
  if (ua.includes("ipad")) return "Tablet";
  if (ua.includes("android")) {
    if (ua.includes("mobile")) return "Mobile";
    return "Tablet";
  }
  if (
    ua.includes("windows") ||
    ua.includes("macintosh") ||
    ua.includes("linux") ||
    ua.includes("x11") ||
    ua.includes("cros")
  ) {
    return "Desktop";
  }
  if (ua.includes("mobile") || ua.includes("phone")) return "Mobile";
  return "Unknown";
}

function detectReferrer(
  referrer: string,
  query = "",
  userAgent = ""
): string {
  return classifyTrafficSource({
    referrer,
    query,
    userAgent,
  }).source;
}

function shouldSkipPath(path: string): boolean {
  const p = (path || "").toLowerCase();
  if (p.startsWith("/admin")) return true;
  if (p.startsWith("/api")) return true;
  if (p.startsWith("/_next")) return true;
  if (p === "/favicon.ico") return true;
  if (p === "/robots.txt") return true;
  if (p.startsWith("/sitemap")) return true;
  return false;
}

function isLikelyBot(ua: string): boolean {
  if (!ua || ua.trim().length < 10) return true;
  return /bot|crawler|spider|slurp|googlebot|bingbot|yandex|baiduspider|facebookexternalhit|twitterbot|linkedinbot|semrush|ahrefs|petalbot|bytespider|headlesschrome|phantomjs|selenium|puppeteer|playwright|wget|curl\/|python-requests|go-http-client|scrapy|lighthouse|pingdom|uptime/i.test(
    ua
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const path = typeof body.path === "string" ? body.path : "/";

    if (shouldSkipPath(path)) {
      return NextResponse.json({ success: true, skipped: "admin_or_internal" });
    }

    const userAgent = request.headers.get("user-agent") ?? "";

    if (isLikelyBot(userAgent)) {
      return NextResponse.json({ success: true, skipped: "bot" });
    }

    const bodyReferrer = typeof body.referrer === "string" ? body.referrer : "";
    const bodyQuery = typeof body.query === "string" ? body.query : "";
    const referrerHeader = request.headers.get("referer") ?? "";

    const rawIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      "";

    const rawCountry =
      request.headers.get("cf-ipcountry") ??
      request.headers.get("x-vercel-ip-country") ??
      request.headers.get("x-country-code") ??
      "";

    let country = normalizeCountry(rawCountry);

    if (isPrivateIp(rawIp)) {
      country = "Development";
    }

    await prisma.analyticsVisit.create({
      data: {
        path,
        visitorId: typeof body.visitorId === "string" ? body.visitorId : "unknown",
        ip: isPrivateIp(rawIp) ? "local" : rawIp.slice(0, 64),
        userAgent: userAgent.slice(0, 512),
        referrer: detectReferrer(
          bodyReferrer || referrerHeader,
          bodyQuery,
          userAgent
        ),
        country,
        browser: detectBrowser(userAgent),
        device: detectDevice(userAgent),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[analytics/track]", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}