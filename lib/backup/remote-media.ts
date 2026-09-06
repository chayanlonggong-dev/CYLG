import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const VIDEO_EXT = new Set([".mp4", ".mov", ".avi", ".webm", ".mkv"]);

function extFromUrl(url: string): string {
  try {
    const clean = url.split("?")[0].split("#")[0];
    const ext = path.extname(clean).toLowerCase();
    if (IMAGE_EXT.has(ext) || VIDEO_EXT.has(ext)) return ext;
  } catch {
    /* ignore */
  }
  if (/\.(mp4|mov|webm|mkv)(\?|$)/i.test(url)) return ".mp4";
  return ".jpg";
}

function extractUrls(raw: string | null | undefined): string[] {
  if (!raw || !raw.trim()) return [];
  let text = raw;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      text = parsed
        .map((item) => (typeof item === "string" ? item : JSON.stringify(item)))
        .join("\n");
    } else if (typeof parsed === "object" && parsed) {
      text = JSON.stringify(parsed);
    } else if (typeof parsed === "string") {
      text = parsed;
    }
  } catch {
    /* not JSON */
  }
  const matches = text.match(/https?:\/\/[^\s"'<>\\]+/gi) || [];
  return matches.map((u) => u.replace(/[),.;]+$/g, ""));
}

export async function collectMediaUrls(): Promise<
  { url: string; label: string }[]
> {
  const found = new Map<string, string>();

  const models = await prisma.model.findMany({
    select: {
      code: true,
      avatar: true,
      gallery: true,
      videos: true,
    },
  });

  for (const model of models) {
    const label = model.code || "model";
    for (const url of extractUrls(model.avatar)) {
      if (!found.has(url)) found.set(url, `${label}-avatar`);
    }
    let i = 0;
    for (const url of extractUrls(model.gallery)) {
      i += 1;
      if (!found.has(url)) found.set(url, `${label}-gallery-${i}`);
    }
    let v = 0;
    for (const url of extractUrls(model.videos)) {
      v += 1;
      if (!found.has(url)) found.set(url, `${label}-video-${v}`);
    }
  }

  const settings = await prisma.websiteSettings.findUnique({
    where: { id: 1 },
  });
  if (settings) {
    for (const url of extractUrls(settings.logo)) {
      if (!found.has(url)) found.set(url, "site-logo");
    }
    for (const url of extractUrls(settings.wechatQr)) {
      if (!found.has(url)) found.set(url, "site-wechat-qr");
    }
  }

  return Array.from(found.entries()).map(([url, label]) => ({ url, label }));
}

export async function downloadRemoteMedia(destination: string): Promise<{
  urls: number;
  downloaded: number;
  failed: number;
}> {
  const items = await collectMediaUrls();
  const remoteDir = path.join(destination, "cloudinary");
  fs.mkdirSync(remoteDir, { recursive: true });

  let downloaded = 0;
  let failed = 0;
  const report: { label: string; url: string; ok: boolean; error?: string }[] =
    [];

  for (const item of items) {
    const ext = extFromUrl(item.url);
    const safe = item.label.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = path.join(remoteDir, `${safe}${ext}`);
    try {
      const res = await fetch(item.url, {
        redirect: "follow",
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) {
        failed += 1;
        report.push({
          label: item.label,
          url: item.url,
          ok: false,
          error: `HTTP ${res.status}`,
        });
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(filePath, buf);
      downloaded += 1;
      report.push({ label: item.label, url: item.url, ok: true });
    } catch (error) {
      failed += 1;
      report.push({
        label: item.label,
        url: item.url,
        ok: false,
        error: error instanceof Error ? error.message : "download failed",
      });
    }
  }

  fs.writeFileSync(
    path.join(destination, "media-manifest.json"),
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        urls: items.length,
        downloaded,
        failed,
        files: report,
      },
      null,
      2
    ),
    "utf8"
  );

  return { urls: items.length, downloaded, failed };
}