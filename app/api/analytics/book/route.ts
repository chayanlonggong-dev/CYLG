import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    await prisma.analyticsVisit.create({
      data: {
        path: `/book/${body.platform}/${body.modelId}`,
        visitorId: body.visitorId ?? "unknown",
        ip:
          request.headers.get("x-forwarded-for") ??
          request.headers.get("x-real-ip") ??
          "",
        userAgent:
          request.headers.get("user-agent") ?? "",
        referrer: body.platform,
        country:
          request.headers.get("cf-ipcountry") ??
          request.headers.get("x-vercel-ip-country") ??
          "Unknown",
        browser: "",
        device: "",
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