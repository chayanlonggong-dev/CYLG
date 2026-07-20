import Link from "next/link";
import type { ReactNode } from "react";

const menu = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/models", label: "Models" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/languages", label: "Languages" },
  { href: "/admin/ai-translation", label: "AI Translation" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/backups", label: "Backups" },
  { href: "/admin/security", label: "Security" },
  { href: "/admin/firewall", label: "Firewall" },
  { href: "/admin/system", label: "System" },
  { href: "/admin/logs", label: "Logs" },
];

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="flex">
        <aside className="sticky top-0 h-screen w-72 border-r border-yellow-500/20 bg-[#0d0d0d]">
          <div className="border-b border-yellow-500/20 p-8">
            <p className="text-sm uppercase tracking-[0.45em] text-yellow-500">
              CYLG CMS
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Admin Panel
            </h2>
          </div>

          <nav className="flex flex-col p-5">
            {menu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="mb-2 rounded-xl px-5 py-3 text-gray-300 transition hover:bg-yellow-500 hover:text-black"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}