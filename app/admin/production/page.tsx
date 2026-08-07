"use client";

import ProductionStatusCard from "@/components/admin/ProductionStatusCard";

export default function ProductionPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-10 py-10 text-white">
      <div className="mx-auto max-w-7xl">

        <p className="uppercase tracking-[0.4em] text-yellow-500">
          CYLG CMS
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Production Ready
        </h1>

        <p className="mt-4 text-gray-400">
          Verify that the entire application is ready for production deployment.
        </p>

        <div className="mt-16">
          <ProductionStatusCard />
        </div>

      </div>
    </main>
  );
}