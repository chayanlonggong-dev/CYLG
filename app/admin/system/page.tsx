"use client";

import SystemStatusCard from "@/components/admin/SystemStatusCard";

export default function SystemPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-10 py-10 text-white">
      <div className="mx-auto max-w-7xl">

        <p className="uppercase tracking-[0.4em] text-yellow-500">
          CYLG CMS
        </p>

        <h1 className="mt-4 text-5xl font-black">
          System Center
        </h1>

        <p className="mt-4 text-gray-400">
          Monitor server, application and database status.
        </p>

        <div className="mt-16">
          <SystemStatusCard />
        </div>

      </div>
    </main>
  );
}