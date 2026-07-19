import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.websiteSettings.findUnique({
      where: {
        id: 1,
      },
    });

    if (!settings) {
      settings = await prisma.websiteSettings.create({
        data: {
          id: 1,

          siteName: "ChaYanLongGong",
          logo: "",

          whatsapp: "",
          telegram: "",
          signal: "",
          line: "",
          wechat: "",

          email: "",

          enableWhatsApp: true,
          enableTelegram: true,
          enableSignal: true,
          enableLine: false,
          enableWechat: false,
          enableFeedbackEmail: true,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load website settings.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const settings = await prisma.websiteSettings.upsert({
      where: {
        id: 1,
      },

      update: {
        siteName: body.siteName ?? "",
        logo: body.logo ?? "",

        whatsapp: body.whatsapp ?? "",
        telegram: body.telegram ?? "",
        signal: body.signal ?? "",
        line: body.line ?? "",
        wechat: body.wechat ?? "",

        email: body.email ?? "",

        enableWhatsApp: body.enableWhatsApp ?? true,
        enableTelegram: body.enableTelegram ?? true,
        enableSignal: body.enableSignal ?? true,
        enableLine: body.enableLine ?? false,
        enableWechat: body.enableWechat ?? false,
        enableFeedbackEmail: body.enableFeedbackEmail ?? true,
      },

      create: {
        id: 1,

        siteName: body.siteName ?? "ChaYanLongGong",
        logo: body.logo ?? "",

        whatsapp: body.whatsapp ?? "",
        telegram: body.telegram ?? "",
        signal: body.signal ?? "",
        line: body.line ?? "",
        wechat: body.wechat ?? "",

        email: body.email ?? "",

        enableWhatsApp: body.enableWhatsApp ?? true,
        enableTelegram: body.enableTelegram ?? true,
        enableSignal: body.enableSignal ?? true,
        enableLine: body.enableLine ?? false,
        enableWechat: body.enableWechat ?? false,
        enableFeedbackEmail: body.enableFeedbackEmail ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save website settings.",
      },
      {
        status: 500,
      }
    );
  }
}