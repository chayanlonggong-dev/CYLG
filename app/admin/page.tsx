import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

/**
 * /admin 入口：
 * - 必須有「有效」的 DB session 才進 Dashboard
 * - 僅有殘留 cookie、或已 logout / session 已刪 → 一律去登入頁（需密碼 + 2FA）
 */
export default async function AdminIndexPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("cylg_admin_session")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  const session = await prisma.session.findUnique({
    where: { token },
    select: {
      id: true,
      expiresAt: true,
    },
  });

  const now = new Date();

  if (!session || session.expiresAt <= now) {
    // Cookie 還在但 session 已無效（例如已 logout）→ 必須重新登入
    redirect("/admin/login");
  }

  redirect("/admin/dashboard");
}