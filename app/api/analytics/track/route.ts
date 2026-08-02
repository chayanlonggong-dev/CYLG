import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    await prisma.analyticsVisit.create({
      data: {
        path: body.path ?? "/",
        visitorId: body.visitorId ?? "unknown",
        ip:
          request.headers.get("x-forwarded-for") ??
          request.headers.get("x-real-ip") ??
          "",
        userAgent:
          request.headers.get("user-agent") ?? "",
        referrer:
          request.headers.get("referer") ?? "",
        country:
          request.headers.get("x-vercel-ip-country") ?? "",
        device: "",
        browser: "",
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