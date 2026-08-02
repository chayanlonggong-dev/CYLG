"use client";

import { useEffect, useState } from "react";

type TopPage = {
  path: string;
  _count: {
    path: number;
  };
};

type RecentVisitor = {
  createdAt: string;
  path: string;
  country: string | null;
  browser: string | null;
  device: string | null;
};

type AnalyticsData = {
  todayVisits: number;
  totalVisits: number;
  uniqueVisitors: number;
  onlineVisitors: number;
  topPages: TopPage[];
  recentVisitors: RecentVisitor[];
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    todayVisits: 0,
    totalVisits: 0,
    uniqueVisitors: 0,
    onlineVisitors: 0,
    topPages: [],
    recentVisitors: [],
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
          Website Traffic Analytics
        </p>

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-xl font-bold text-yellow-400">
              Today's Visits
            </h2>

            <p className="mt-6 text-5xl font-black">
              {data.todayVisits}
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-xl font-bold text-yellow-400">
              Total Visits
            </h2>

            <p className="mt-6 text-5xl font-black">
              {data.totalVisits}
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-xl font-bold text-yellow-400">
              Unique Visitors
            </h2>

            <p className="mt-6 text-5xl font-black">
              {data.uniqueVisitors}
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-xl font-bold text-yellow-400">
              Online Visitors
            </h2>

            <p className="mt-6 text-5xl font-black">
              {data.onlineVisitors}
            </p>
          </div>

        </div>

        <div className="mt-12 grid gap-8 xl:grid-cols-2">

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">

            <h2 className="text-2xl font-bold text-yellow-400">
              Top Pages
            </h2>

            <div className="mt-6 space-y-4">

              {data.topPages.length === 0 && (
                <p className="text-gray-500">
                  No data
                </p>
              )}

              {data.topPages.map((page) => (
                <div
                  key={page.path}
                  className="flex items-center justify-between border-b border-white/10 pb-3"
                >
                  <span className="font-mono text-sm">
                    {page.path}
                  </span>

                  <span className="font-bold text-yellow-400">
                    {page._count.path}
                  </span>
                </div>
              ))}

            </div>

          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">

            <h2 className="text-2xl font-bold text-yellow-400">
              Recent Visitors
            </h2>

            <div className="mt-6 space-y-4">

              {data.recentVisitors.length === 0 && (
                <p className="text-gray-500">
                  No data
                </p>
              )}

              {data.recentVisitors.map((visitor, index) => (

                <div
                  key={index}
                  className="rounded-xl border border-white/10 p-4"
                >

                  <div className="text-sm text-gray-400">
                    {new Date(visitor.createdAt).toLocaleString()}
                  </div>

                  <div className="mt-2 font-mono text-yellow-400">
                    {visitor.path}
                  </div>

                  <div className="mt-2 text-sm text-gray-400">
                    {visitor.country || "-"} · {visitor.browser || "-"} · {visitor.device || "-"}
                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}