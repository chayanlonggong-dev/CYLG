"use client";

import { useEffect, useState } from "react";

type AnalyticsData = {
  totalModels: number;
  onlineModels: number;
  offlineModels: number;
  featuredModels: number;
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    totalModels: 0,
    onlineModels: 0,
    offlineModels: 0,
    featuredModels: 0,
  });

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await fetch("/api/admin/analytics");
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadAnalytics();
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] px-10 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="uppercase tracking-[0.4em] text-yellow-500">
          CYLG CMS
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Analytics
        </h1>

        <p className="mt-4 text-gray-400">
          Website statistics overview.
        </p>

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-xl font-bold text-yellow-400">
              Total Models
            </h2>

            <p className="mt-6 text-5xl font-black">
              {data.totalModels}
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-xl font-bold text-yellow-400">
              Online Models
            </h2>

            <p className="mt-6 text-5xl font-black">
              {data.onlineModels}
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-xl font-bold text-yellow-400">
              Offline Models
            </h2>

            <p className="mt-6 text-5xl font-black">
              {data.offlineModels}
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-xl font-bold text-yellow-400">
              Featured Models
            </h2>

            <p className="mt-6 text-5xl font-black">
              {data.featuredModels}
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}