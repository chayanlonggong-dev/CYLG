"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/models", label: "Models" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/languages", label: "Languages" },
  { href: "/admin/ai-translation", label: "AI Translation" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/top-models", label: "Top Models" },
  { href: "/admin/backups", label: "Backups" },
  { href: "/admin/security", label: "Security" },
  { href: "/admin/firewall", label: "Firewall" },
  { href: "/admin/system", label: "System" },
  { href: "/admin/production", label: "Production" },
  { href: "/admin/logs", label: "Logs" },
];

export default function AdminSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login" || pathname === "/admin";

  // Close drawer on route change (mobile)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open on mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Login / root admin page: no sidebar (same as original behavior for centered form)
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Mobile top bar */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-yellow-500/20 bg-[#0d0d0d] px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-yellow-500 hover:bg-yellow-500/10"
          aria-label="Open menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-[0.35em] text-yellow-500">
            CYLG CMS
          </span>
          <span className="text-sm font-bold text-white">Admin</span>
        </div>

        {/* spacer to balance the hamburger */}
        <div className="h-10 w-10" />
      </header>

      {/* Overlay (mobile only) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          flex h-screen w-72 flex-col
          border-r border-yellow-500/20 bg-[#0d0d0d]
          transition-transform duration-300 ease-in-out
          lg:sticky lg:translate-x-0 lg:z-auto
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Sidebar header */}
        <div className="relative border-b border-yellow-500/20 p-6 lg:p-8">
          {/* Close button (mobile) */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <p className="text-sm uppercase tracking-[0.45em] text-yellow-500">
            CYLG CMS
          </p>

          <h2 className="mt-2 text-2xl font-black lg:mt-3 lg:text-3xl">
            Admin Panel
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col overflow-y-auto p-4 lg:p-5">
          {menu.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" &&
                pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`
                  mb-1.5 rounded-xl px-4 py-3 text-sm transition
                  lg:mb-2 lg:px-5 lg:py-3 lg:text-base
                  ${
                    isActive
                      ? "bg-yellow-500 text-black font-semibold"
                      : "text-gray-300 hover:bg-yellow-500 hover:text-black"
                  }
                `}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 pt-14 lg:pt-0 min-w-0">
        {children}
      </main>
    </div>
  );
}