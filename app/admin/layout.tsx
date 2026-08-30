import type { ReactNode } from "react";

import SessionManager from "@/components/admin/SessionManager";
import NotificationProvider from "@/components/admin/NotificationProvider";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <SessionManager />

      <NotificationProvider>
        <AdminSidebar>{children}</AdminSidebar>
      </NotificationProvider>
    </div>
  );
}