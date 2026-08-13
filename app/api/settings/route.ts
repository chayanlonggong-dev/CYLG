import {
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/lib/prisma";

import {
  unlink,
} from "fs/promises";

import path from "path";

import {
  requireAdminSession,
} from "@/lib/auth/session";

import {
  rateLimit,
} from "@/lib/rateLimit";

import {
  createAuditLog,
} from "@/lib/audit/audit";

import {
  apiError,
  apiServerError,
  apiSuccess,
} from "@/lib/api/response";

import {
  revalidatePath,
} from "next/cache";

// =======================
// GET SETTINGS
// =======================

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
          favicon: "",
          whatsapp: "",
          telegram: "",
          signal: "",
          line: "",
          wechatQr: "",
          email: "",
          enableWhatsApp: true,
          enableTelegram: true,
          enableSignal: false,
          enableLine: false,
          enableWechat: false,
          enableFeedbackEmail: true,
          enableChineseTraditional: true,
          enableChineseSimplified: true,
          enableJapanese: true,
          enableKorean: true,
        },
      });
    }

    return apiSuccess(settings, "Settings loaded.", 200);
  } catch (error) {
    console.error(error);
    return apiServerError("Failed to load website settings.", "FETCH_SETTINGS_FAILED");
  }
}

// =======================
// DELETE FAVICON / WECHAT QR
// =======================

export async function DELETE(
  request: Request
) {
  try {
    const session = await requireAdminSession();

    const limit = rateLimit(
      `settings-delete:${session.adminUserId}`,
      {
        limit: 5,
        windowMs: 60 * 60 * 1000,
      }
    );

    if (!limit.success) {
      return apiError("Too many requests.", 429, "RATE_LIMITED");
    }

    const body = await request.json();

    const field =
      typeof body?.field === "string"
        ? body.field
        : "favicon"; // 預設維持原本 favicon 行為

    const storedPath =
      typeof body?.path === "string"
        ? body.path
        : "";

    // 刪除實際檔案
    if (storedPath) {
      const relativePath = storedPath.replace(/^\/+/, "");
      const absolutePath = path.join(
        process.cwd(),
        "public",
        relativePath
      );

      try {
        await unlink(absolutePath);
      } catch (error: any) {
        if (error?.code !== "ENOENT") {
          throw error;
        }
      }
    }

    // 只清對應欄位
    const dataToUpdate =
      field === "wechatQr"
        ? { wechatQr: "" }
        : { favicon: "" };

    const settings = await prisma.websiteSettings.update({
      where: {
        id: 1,
      },
      data: dataToUpdate,
    });

    createAuditLog({
      action: "UPDATE",
      entity: "WebsiteSettings",
      entityId: 1,
      userId: String(session.adminUserId),
      description:
        field === "wechatQr"
          ? "Admin deleted WeChat QR code."
          : "Admin deleted website favicon.",
    });

    revalidatePath("/");
    revalidatePath("/models", "layout");

    return apiSuccess({ settings }, "Deleted successfully.", 200);
  } catch (error) {
    console.error(error);
    return apiServerError("Failed to delete.", "DELETE_FAILED");
  }
}

// =======================
// UPDATE SETTINGS
// =======================

export async function PUT(
  request: Request
) {
  try {
    const session = await requireAdminSession();

    const limit = rateLimit(
      `settings-update:${session.adminUserId}`,
      {
        limit: 20,
        windowMs: 60 * 60 * 1000,
      }
    );

    if (!limit.success) {
      return apiError("Too many requests.", 429, "RATE_LIMITED");
    }

    const body = await request.json();

    const settings = await prisma.websiteSettings.upsert({
      where: {
        id: 1,
      },
      update: {
        siteName: body.siteName ?? "",
        logo: body.logo ?? "",
        favicon: body.favicon ?? "",
        whatsapp: body.whatsapp ?? "",
        telegram: body.telegram ?? "",
        signal: body.signal ?? "",
        line: body.line ?? "",
        wechatQr: body.wechatQr ?? "",
        email: body.email ?? "",
        enableWhatsApp: body.enableWhatsApp ?? body.enableWhatsapp ?? true,
        enableTelegram: body.enableTelegram ?? true,
        enableSignal: body.enableSignal ?? false,
        enableLine: body.enableLine ?? false,
        enableWechat: body.enableWechat ?? false,
        enableFeedbackEmail: body.enableFeedbackEmail ?? true,
        enableChineseTraditional:
          body.enableChineseTraditional ?? true,
        enableChineseSimplified:
          body.enableChineseSimplified ?? true,
        enableJapanese:
          body.enableJapanese ?? true,
        enableKorean:
          body.enableKorean ?? true,
      },
      create: {
        id: 1,
        siteName: body.siteName ?? "ChaYanLongGong",
        logo: body.logo ?? "",
        favicon: body.favicon ?? "",
        whatsapp: body.whatsapp ?? "",
        telegram: body.telegram ?? "",
        signal: body.signal ?? "",
        line: body.line ?? "",
        wechatQr: body.wechatQr ?? "",
        email: body.email ?? "",
        enableWhatsApp: body.enableWhatsApp ?? body.enableWhatsapp ?? true,
        enableTelegram: body.enableTelegram ?? true,
        enableSignal: body.enableSignal ?? false,
        enableLine: body.enableLine ?? false,
        enableWechat: body.enableWechat ?? false,
        enableFeedbackEmail: body.enableFeedbackEmail ?? true,
        enableChineseTraditional:
          body.enableChineseTraditional ?? true,
        enableChineseSimplified:
          body.enableChineseSimplified ?? true,
        enableJapanese:
          body.enableJapanese ?? true,
        enableKorean:
          body.enableKorean ?? true,
      },
    });

    createAuditLog({
      action: "SETTINGS_CHANGE",
      entity: "WebsiteSettings",
      entityId: 1,
      userId: String(session.adminUserId),
      description: "Admin updated website settings.",
    });

    revalidatePath("/");
    revalidatePath("/models", "layout");

    return apiSuccess({ settings }, "Settings updated.", 200);
  } catch (error) {
    console.error(error);
    return apiServerError("Failed to save website settings.", "SAVE_SETTINGS_FAILED");
  }
}