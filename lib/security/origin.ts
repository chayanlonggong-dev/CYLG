import { NextRequest } from "next/server";

/**
 * 驗證 Admin API 的 Origin / Host，阻擋跨站請求。
 * 允許：同源、明確白名單、或缺少 Origin 的同站導航（部分瀏覽器）。
 */
export function verifyAdminOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host");

  if (!host) {
    return false;
  }

  const allowedHosts = new Set<string>();

  allowedHosts.add(host.toLowerCase());

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      allowedHosts.add(new URL(siteUrl).host.toLowerCase());
    } catch {
      // ignore invalid env
    }
  }

  // 本機開發
  allowedHosts.add("localhost:3000");
  allowedHosts.add("127.0.0.1:3000");

  if (!origin) {
    // 無 Origin 時用 Referer 輔助（部分同站請求）
    const referer = request.headers.get("referer");
    if (!referer) {
      // 允許無 Origin 的伺服器對伺服器 / 同站導航
      return true;
    }
    try {
      const refHost = new URL(referer).host.toLowerCase();
      return allowedHosts.has(refHost);
    } catch {
      return false;
    }
  }

  try {
    const originHost = new URL(origin).host.toLowerCase();
    return allowedHosts.has(originHost);
  } catch {
    return false;
  }
}