import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function detectBrowser(userAgent: string): string {
  const ua = userAgent;

  if (/Edg\/([\d.]+)/i.test(ua)) {
    return "Edge";
  }

  if (/OPR\/([\d.]+)/i.test(ua)) {
    return "Opera";
  }

  if (/Brave/i.test(ua)) {
    return "Brave";
  }

  if (/SamsungBrowser\/([\d.]+)/i.test(ua)) {
    return "Samsung Internet";
  }

  if (/DuckDuckGo/i.test(ua)) {
    return "DuckDuckGo";
  }

  if (/Arc/i.test(ua)) {
    return "Arc";
  }

  if (/Firefox\/([\d.]+)/i.test(ua)) {
    return "Firefox";
  }

  if (
    /Chrome\/([\d.]+)/i.test(ua) &&
    !/Edg|OPR/i.test(ua)
  ) {
    return "Chrome";
  }

  if (/Version\/([\d.]+).*Safari/i.test(ua)) {
    return "Safari";
  }

  return "Unknown";
}

function detectDevice(userAgent: string): string {
  const ua = userAgent.toLowerCase();

  // Apple
  if (ua.includes("iphone")) {
    return "Mobile";
  }

  if (ua.includes("ipad")) {
    return "Tablet";
  }

  // Android
  if (ua.includes("android")) {
    if (ua.includes("mobile")) {
      return "Mobile";
    }

    return "Tablet";
  }

  // Desktop OS
  if (
    ua.includes("windows") ||
    ua.includes("macintosh") ||
    ua.includes("linux") ||
    ua.includes("x11")
  ) {
    return "Desktop";
  }

  return "Desktop";
}

function detectReferrer(referrer: string): string {
  if (!referrer) return "Direct";

  const url = referrer.toLowerCase();

  if (url.includes("google.")) return "Google";
  if (url.includes("bing.")) return "Bing";
  if (url.includes("yahoo.")) return "Yahoo";
  if (url.includes("duckduckgo.")) return "DuckDuckGo";

  if (url.includes("facebook.")) return "Facebook";
  if (url.includes("instagram.")) return "Instagram";
  if (url.includes("threads.")) return "Threads";
  if (url.includes("x.com") || url.includes("twitter.")) return "X";

  if (url.includes("telegram.")) return "Telegram";
  if (url.includes("whatsapp.")) return "WhatsApp";
  if (url.includes("line.me")) return "LINE";
  if (url.includes("wechat.")) return "WeChat";

  if (url.includes("reddit.")) return "Reddit";
  if (url.includes("youtube.")) return "YouTube";
  if (url.includes("tiktok.")) return "TikTok";

  return "Other";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const userAgent =
      request.headers.get("user-agent") ?? "";

    const referrer =
      request.headers.get("referer") ?? "";

    const rawCountry =
      request.headers.get("cf-ipcountry") ??
      request.headers.get("x-vercel-ip-country") ??
      "";

    const country =
      rawCountry &&
      rawCountry !== "XX" &&
      rawCountry !== "unknown"
        ? rawCountry
        : "Local Development";

    await prisma.analyticsVisit.create({
      data: {
        path: body.path ?? "/",

        visitorId:
          body.visitorId ?? "unknown",

        ip:
          request.headers.get("x-forwarded-for") ??
          request.headers.get("x-real-ip") ??
          "",

        userAgent,

        referrer: detectReferrer(referrer),

        country: country.trim(),

        browser: detectBrowser(userAgent),

        device: detectDevice(userAgent),
      },
    });

    return NextResponse.json({
      success: true,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );

  }
}