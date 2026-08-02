import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function detectBrowser(userAgent: string): string {
  if (userAgent.includes("Edg")) return "Edge";
  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    return "Safari";
  }

  return "Unknown";
}

function detectDevice(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return "Mobile";
  if (/tablet|ipad/i.test(userAgent)) return "Tablet";

  return "Desktop";
}

function detectReferrer(referrer: string): string {
  if (!referrer) return "Direct";

  if (referrer.includes("google")) return "Google";
  if (referrer.includes("bing")) return "Bing";
  if (referrer.includes("facebook")) return "Facebook";
  if (referrer.includes("instagram")) return "Instagram";
  if (referrer.includes("telegram")) return "Telegram";
  if (referrer.includes("line")) return "LINE";
  if (referrer.includes("twitter") || referrer.includes("x.com")) {
    return "X";
  }

  return "Other";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const userAgent =
      request.headers.get("user-agent") ?? "";

    const referrer =
      request.headers.get("referer") ?? "";

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

        country:
          request.headers.get("x-vercel-ip-country") ??
          "",

        browser:
          detectBrowser(userAgent),

        device:
          detectDevice(userAgent),
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