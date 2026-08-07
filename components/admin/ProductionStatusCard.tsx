"use client";

import { useEffect, useState } from "react";

type ProductionData = {
  checks: {
    database: boolean;
    uploads: boolean;
    backups: boolean;
    environment: boolean;
    prisma: boolean;
    node: boolean;
  };

  score: number;
  passed: number;
  total: number;
  ready: string;
};

export default function ProductionStatusCard() {
  const [loading, setLoading] = useState(true);

  const [data, setData] =
    useState<ProductionData | null>(null);

  async function loadStatus() {
    try {
      const response = await fetch(
        "/api/admin/production",
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
        Loading Production Status...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-[#101010] p-8 text-red-400">
        Failed to load production status.
      </div>
    );
  }

  function Row(
    label: string,
    value: boolean
  ) {
    return (
      <div className="flex items-center justify-between rounded-xl bg-[#181818] px-5 py-4">
        <span>{label}</span>

        <span
          className={
            value
              ? "font-bold text-green-400"
              : "font-bold text-red-400"
          }
        >
          {value ? "PASS" : "FAIL"}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-yellow-400">
            Production Ready
          </h2>

          <p className="mt-2 text-gray-400">
            Deployment readiness check
          </p>

        </div>

        <div
          className={`rounded-full px-5 py-3 font-bold ${
            data.score === 100
              ? "bg-green-600 text-white"
              : "bg-yellow-600 text-black"
          }`}
        >
          {data.ready}
        </div>

      </div>

      <div className="mt-8 grid gap-4">

        {Row(
          "Database Connection",
          data.checks.database
        )}

        {Row(
          "Upload Folder",
          data.checks.uploads
        )}

        {Row(
          "Backup Folder",
          data.checks.backups
        )}

        {Row(
          "Environment Variables",
          data.checks.environment
        )}

        {Row(
          "Prisma Client",
          data.checks.prisma
        )}

        {Row(
          "Node Runtime",
          data.checks.node
        )}

      </div>

      <div className="mt-10 rounded-2xl bg-[#181818] p-6">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-gray-400">
              Overall Score
            </p>

            <p className="mt-2 text-5xl font-black text-yellow-400">
              {data.score}%
            </p>

          </div>

          <div className="text-right">

            <p className="text-gray-400">
              Passed
            </p>

            <p className="mt-2 text-3xl font-bold">
              {data.passed}/{data.total}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}