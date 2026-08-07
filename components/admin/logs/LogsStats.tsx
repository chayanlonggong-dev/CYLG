"use client";

import { useEffect, useState } from "react";

type Stats = {
  totalLogs: number;
  todayLogs: number;
  failedLogins: number;
  errors: number;
  warnings: number;
};

export default function LogsStats() {
  const [stats, setStats] = useState<Stats>({
    totalLogs: 0,
    todayLogs: 0,
    failedLogins: 0,
    errors: 0,
    warnings: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const res = await fetch("/api/admin/logs/stats", {
        cache: "no-store",
      });

      const json = await res.json();

      if (json.success) {
        setStats(json.data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="mt-10 grid gap-6 md:grid-cols-5">
      <div className="rounded-2xl border border-yellow-500/20 bg-[#101010] p-6">
        <p className="text-sm text-gray-400">Total Logs</p>
        <h2 className="mt-3 text-3xl font-bold text-yellow-400">
          {stats.totalLogs}
        </h2>
      </div>

      <div className="rounded-2xl border border-yellow-500/20 bg-[#101010] p-6">
        <p className="text-sm text-gray-400">Today's Logs</p>
        <h2 className="mt-3 text-3xl font-bold text-white">
          {stats.todayLogs}
        </h2>
      </div>

      <div className="rounded-2xl border border-yellow-500/20 bg-[#101010] p-6">
        <p className="text-sm text-gray-400">Failed Logins</p>
        <h2 className="mt-3 text-3xl font-bold text-red-400">
          {stats.failedLogins}
        </h2>
      </div>

      <div className="rounded-2xl border border-yellow-500/20 bg-[#101010] p-6">
        <p className="text-sm text-gray-400">Errors</p>
        <h2 className="mt-3 text-3xl font-bold text-red-500">
          {stats.errors}
        </h2>
      </div>

      <div className="rounded-2xl border border-yellow-500/20 bg-[#101010] p-6">
        <p className="text-sm text-gray-400">Warnings</p>
        <h2 className="mt-3 text-3xl font-bold text-orange-400">
          {stats.warnings}
        </h2>
      </div>
    </div>
  );
}