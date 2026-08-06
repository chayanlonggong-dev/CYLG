"use client";

import { useEffect, useState } from "react";

type SystemInfo = {
  server: string;
  database: string;
  databasePing: number;
  health: string;

  environment: string;
  platform: string;
  hostname: string;
  uptime: number;

  memory: {
    total: number;
    free: number;
    used: number;
    usage: number;
  };

  cpu: {
    cores: number;
    model: string;
    usage: number | null;
  };

  disk: {
    total: number | null;
    free: number | null;
    used: number | null;
    usage: number | null;
  };

  node: string;
  next: string;
  react: string;
  prisma: string;
  version: string;
};

function formatUptime(seconds: number) {
  const days = Math.floor(seconds / 86400);

  const hours = Math.floor(
    (seconds % 86400) / 3600
  );

  const minutes = Math.floor(
    (seconds % 3600) / 60
  );

  return `${days}d ${hours}h ${minutes}m`;
}

export default function SystemStatusCard() {
  const [loading, setLoading] = useState(true);

  const [system, setSystem] =
    useState<SystemInfo | null>(null);

  async function loadSystem() {
    try {
      const response = await fetch(
        "/api/admin/system",
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (result.success) {
        setSystem(result.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSystem();

    const timer = setInterval(
      loadSystem,
      5000
    );

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
        <p className="text-gray-400">
          Loading system information...
        </p>
      </div>
    );
  }

  if (!system) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-[#101010] p-8">
        <p className="text-red-400">
          Failed to load system information.
        </p>
      </div>
    );
  }  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-bold text-yellow-400">
            System Monitor
          </h2>

          <p className="mt-2 text-gray-400">
            Auto refresh every 5 seconds
          </p>
        </div>

        <div
          className={`rounded-full px-4 py-2 font-bold ${
            system.health === "Healthy"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {system.health}
        </div>

      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-xl bg-[#181818] p-5">
          <p className="text-gray-400">Server</p>
          <p className="mt-2 text-2xl font-bold text-green-400">
            {system.server}
          </p>
        </div>

        <div className="rounded-xl bg-[#181818] p-5">
          <p className="text-gray-400">Database</p>
          <p className="mt-2 text-2xl font-bold text-green-400">
            {system.database}
          </p>

          <p className="mt-2 text-sm text-gray-400">
            Ping：{system.databasePing} ms
          </p>
        </div>

        <div className="rounded-xl bg-[#181818] p-5">
          <p className="text-gray-400">Memory</p>

          <p className="mt-2">
            {system.memory.used} GB / {system.memory.total} GB
          </p>

          <p className="mt-2 text-yellow-400 font-bold">
            {system.memory.usage}% Used
          </p>
        </div>

        <div className="rounded-xl bg-[#181818] p-5">
          <p className="text-gray-400">Version</p>

          <p className="mt-2 text-2xl font-bold text-yellow-400">
            v{system.version}
          </p>
        </div>

      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">

        <div className="rounded-xl bg-[#181818] p-6">

          <h3 className="text-xl font-bold text-yellow-400">
            Runtime
          </h3>

          <div className="mt-6 space-y-4">

            <p>
              <span className="text-gray-400">
                Environment：
              </span>{" "}
              {system.environment}
            </p>

            <p>
              <span className="text-gray-400">
                Platform：
              </span>{" "}
              {system.platform}
            </p>

            <p>
              <span className="text-gray-400">
                Hostname：
              </span>{" "}
              {system.hostname}
            </p>

            <p>
              <span className="text-gray-400">
                Uptime：
              </span>{" "}
              {formatUptime(system.uptime)}
            </p>

            <p>
              <span className="text-gray-400">
                Node：
              </span>{" "}
              {system.node}
            </p>

          </div>

        </div>

        <div className="rounded-xl bg-[#181818] p-6">

          <h3 className="text-xl font-bold text-yellow-400">
            Software
          </h3>

          <div className="mt-6 space-y-4">

            <p>
              <span className="text-gray-400">
                Next.js：
              </span>{" "}
              {system.next}
            </p>

            <p>
              <span className="text-gray-400">
                React：
              </span>{" "}
              {system.react}
            </p>

            <p>
              <span className="text-gray-400">
                Prisma：
              </span>{" "}
              {system.prisma}
            </p>

            <p>
              <span className="text-gray-400">
                CPU：
              </span>{" "}
              {system.cpu.cores} Cores
            </p>

            <p className="wrap-break-word text-sm text-gray-400">
              {system.cpu.model}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}