import { prisma } from "@/lib/prisma";

export async function restoreWebsiteSettings(
  websiteSettings: any[]
) {
  if (!Array.isArray(websiteSettings)) {
    return {
      success: false,
      message: "Invalid WebsiteSettings data.",
    };
  }

  try {
    // 清空现有 WebsiteSettings
    await prisma.websiteSettings.deleteMany();

    // 没有资料
    if (websiteSettings.length === 0) {
      return {
        success: true,
        restored: 0,
      };
    }

    // 恢复 WebsiteSettings
    await prisma.websiteSettings.createMany({
      data: websiteSettings.map((settings) => ({
        id: settings.id ?? 1,

        siteName: settings.siteName ?? "ChaYanLongGong",
        logo: settings.logo ?? "",

        whatsapp: settings.whatsapp ?? "",
        telegram: settings.telegram ?? "",
        signal: settings.signal ?? "",
        line: settings.line ?? "",
        wechatQr: settings.wechatQr ?? "",
        email: settings.email ?? "",

        enableWhatsApp:
          settings.enableWhatsApp ?? true,

        enableTelegram:
          settings.enableTelegram ?? true,

        enableSignal:
          settings.enableSignal ?? false,

        enableLine:
          settings.enableLine ?? false,

        enableWechat:
          settings.enableWechat ?? false,

        enableFeedbackEmail:
          settings.enableFeedbackEmail ?? true,

        favicon: settings.favicon ?? "",

        createdAt: settings.createdAt
          ? new Date(settings.createdAt)
          : new Date(),

        updatedAt: settings.updatedAt
          ? new Date(settings.updatedAt)
          : new Date(),
      })),
    });

    return {
      success: true,
      restored: websiteSettings.length,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Failed to restore WebsiteSettings.",
    };
  }
}