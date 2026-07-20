"use client";

import Link from "next/link";

const actions = [
  {
    title: "Models",
    description: "Manage all model profiles",
    href: "/admin/models",
  },
  {
    title: "Website Settings",
    description: "Configure contacts and branding",
    href: "/admin/settings",
  },
  {
    title: "Translations",
    description: "Manage multilingual content",
    href: "/admin/translations",
  },
  {
    title: "Security",
    description: "Firewall and protection",
    href: "/admin/security",
  },
  {
    title: "System",
    description: "System configuration",
    href: "/admin/system",
  },
  {
    title: "Analytics",
    description: "Traffic and statistics",
    href: "/admin/analytics",
  },
];

export default function QuickActions() {
  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-[#111111] p-8">
      <h2 className="text-2xl font-black text-white">
        Quick Actions
      </h2>

      <p className="mt-3 text-gray-400">
        Quickly navigate to the most frequently used CMS modules.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-2xl border border-yellow-500/20 bg-[#181818] p-6 transition duration-300 hover:border-yellow-500 hover:bg-[#202020]"
          >
            <h3 className="text-lg font-bold text-yellow-500">
              {action.title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              {action.description}
            </p>

            <div className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-yellow-500">
              Open →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}