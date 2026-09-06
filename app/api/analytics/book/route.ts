import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  FR: "France",
  IE: "Ireland",
  CA: "Canada",
  SE: "Sweden",
  GB: "United Kingdom",
  UK: "United Kingdom",
  DE: "Germany",
  AU: "Australia",
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
    cleaned === "0.0.0.0"
  )
    return true;
  if (cleaned.startsWith("10.") || cleaned.startsWith("192.168.") || cleaned.startsWith("169.254."))
    return true;
  const m = cleaned.match(/^172\.(\d+)\./);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 16 && n <= 31) return true;
  }
  return false;
}

function detectBrowser(userAgent: string): string {
  const ua = userAgent || "";
  if (/Edg\/([\d.]+)/i.test(ua)) return "Edge";
  if (/Firefox\/([\d.]+)/i.test(ua) || /FxiOS/i.test(ua)) return "Firefox";
  if (/Chrome\/([\d.]+)/i.test(ua) && !/Edg|OPR|Brave/i.test(ua)) return "Chrome";
  if (/Version\/([\d.]+).*Safari/i.test(ua) || (/Safari/i.test(ua) && !/Chrome/i.test(ua)))
    return "Safari";
  return "Unknown";
}

function detectDevice(userAgent: string): string {
  const ua = (userAgent || "").toLowerCase();
  if (ua.includes("iphone") || ua.includes("ipod")) return "Mobile";
  if (ua.includes("ipad")) return "Tablet";
  if (ua.includes("android")) return ua.includes("mobile") ? "Mobile" : "Tablet";
  if (ua.includes("windows") || ua.includes("macintosh") || ua.includes("linux")) return "Desktop";
  return "Unknown";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const platform = typeof body.platform === "string" ? body.platform.toLowerCase() : "unknown";
    const modelId = body.modelId ?? body.modelCode ?? "unknown";
    const visitorId = typeof body.visitorId === "string" ? body.visitorId : "unknown";

    const userAgent = request.headers.get("user-agent") ?? "";
    const rawIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      "";

    const rawCountry =
      request.headers.get("cf-ipcountry") ??
      request.headers.get("x-vercel-ip-country") ??
      "";

    let country = normalizeCountry(rawCountry);
    if (isPrivateIp(rawIp)) {
      country = "Development";
    }

    await prisma.analyticsVisit.create({
      data: {
        path: `/book/${platform}/${modelId}`,
        visitorId,
        ip: isPrivateIp(rawIp) ? "local" : rawIp.slice(0, 64),
        userAgent: userAgent.slice(0, 512),
        referrer: platform,
        country,
        browser: detectBrowser(userAgent),
        device: detectDevice(userAgent),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[analytics/book]", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}