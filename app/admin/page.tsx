import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * /admin 入口：不再顯示沒有 handler 的假登入表單。
 * - 有 session cookie → Dashboard
 * - 無 session → 真登入頁 /admin/login
 */
export default async function AdminIndexPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("cylg_admin_session");

  if (session?.value) {
    redirect("/admin/dashboard");
  }

  redirect("/admin/login");
}