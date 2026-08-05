"use client";

import { useEffect, useState } from "react";

type SystemData = {
  server: string;
  database: string;
  environment: string;
  platform: string;
  hostname: string;
  uptime: number;
  memory: {
    total: number;
    free: number;
  };
  cpu: {
    cores: number;
    model: string;
  };
  node: string;
  next: string;
  react: string;
  prisma: string;
  version: string;
};

export default function SystemPage() {
  const [data, setData] = useState<SystemData | null>(null);

  useEffect(() => {
    async function loadSystem() {
      try {
        const response = await fetch("/api/admin/system");
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadSystem();
  }, []);

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

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-xl font-bold text-yellow-400">
              Server
            </h2>

            <p className="mt-6 text-4xl font-black text-green-400">
              {data?.server ?? "--"}
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-xl font-bold text-yellow-400">
              Database
            </h2>

            <p className="mt-6 text-4xl font-black text-green-400">
              {data?.database ?? "--"}
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-xl font-bold text-yellow-400">
              Memory
            </h2>

            <p className="mt-6 text-3xl font-black">
              {data
                ? `${data.memory.free} GB / ${data.memory.total} GB`
                : "--"}
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-xl font-bold text-yellow-400">
              Version
            </h2>

            <p className="mt-6 text-4xl font-black">
              {data?.version ?? "--"}
            </p>
          </div>

        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">

            <h2 className="text-2xl font-bold text-yellow-400">
              Runtime
            </h2>

            <div className="mt-6 space-y-4 text-lg">

              <p>
                <span className="text-gray-400">Environment：</span>{" "}
                {data?.environment}
              </p>

              <p>
                <span className="text-gray-400">Platform：</span>{" "}
                {data?.platform}
              </p>

              <p>
                <span className="text-gray-400">Hostname：</span>{" "}
                {data?.hostname}
              </p>

              <p>
                <span className="text-gray-400">Node：</span>{" "}
                {data?.node}
              </p>

              <p>
                <span className="text-gray-400">Uptime：</span>{" "}
                {data
                  ? `${Math.floor(data.uptime / 3600)} hrs`
                  : "--"}
              </p>

            </div>

          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">

            <h2 className="text-2xl font-bold text-yellow-400">
              Software
            </h2>

            <div className="mt-6 space-y-4 text-lg">

              <p>
                <span className="text-gray-400">Next.js：</span>{" "}
                {data?.next}
              </p>

              <p>
                <span className="text-gray-400">React：</span>{" "}
                {data?.react}
              </p>

              <p>
                <span className="text-gray-400">Prisma：</span>{" "}
                {data?.prisma}
              </p>

              <p>
                <span className="text-gray-400">CPU：</span>{" "}
                {data?.cpu.model}
              </p>

              <p>
                <span className="text-gray-400">CPU Cores：</span>{" "}
                {data?.cpu.cores}
              </p>

            </div>

          </div>

        </div>
      </div>
    </main>
  );
}