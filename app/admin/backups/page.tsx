"use client";

import { useEffect, useState } from "react";

type BackupRecord = {
  id: string;
  filename: string;
  type: string;
  size: number;
  status: string;
  createdAt: string;
};

export default function BackupsPage() {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadBackups() {
    try {
      const response = await fetch("/api/admin/backups");
      const result = await response.json();

      if (result.success) {
        setBackups(result.data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function createBackup() {
    setLoading(true);
const now = new Date();

const filename =
  `CYLG-DB-${
    now.getFullYear()
  }${
    String(now.getMonth() + 1).padStart(2, "0")
  }${
    String(now.getDate()).padStart(2, "0")
  }-${
    String(now.getHours()).padStart(2, "0")
  }${
    String(now.getMinutes()).padStart(2, "0")
  }${
    String(now.getSeconds()).padStart(2, "0")
  }.json`;
  
    try {
      const response = await fetch("/api/admin/backups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  filename,
  type: "Database",
  size: 0,
}),
      });

      const result = await response.json();

      if (result.success) {
        await loadBackups();
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadBackups();
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] px-10 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="uppercase tracking-[0.4em] text-yellow-500">
          CYLG CMS
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Backup Center
        </h1>

        <p className="mt-4 text-gray-400">
          Manage database and media backups.
        </p>

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-2xl font-bold text-yellow-400">
              Database Backup
            </h2>

            <p className="mt-4 text-gray-400">
              Backup all model and website data.
            </p>

            <button
              onClick={createBackup}
              disabled={loading}
              className="mt-8 rounded-full bg-yellow-500 px-8 py-3 font-bold text-black transition hover:bg-yellow-400 disabled:opacity-50"
            >
              {loading ? "Backing Up..." : "Backup Now"}
            </button>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-2xl font-bold text-yellow-400">
              Media Backup
            </h2>

            <p className="mt-4 text-gray-400">
              Backup uploaded images and videos.
            </p>

            <button className="mt-8 rounded-full bg-yellow-500 px-8 py-3 font-bold text-black transition hover:bg-yellow-400">
              Backup Media
            </button>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-2xl font-bold text-yellow-400">
              Restore
            </h2>

            <p className="mt-4 text-gray-400">
              Restore from previous backup files.
            </p>

            <button className="mt-8 rounded-full border border-yellow-500 px-8 py-3 font-bold text-yellow-500 transition hover:bg-yellow-500 hover:text-black">
              Restore Backup
            </button>
          </div>
        </div>

        <div className="mt-16 rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
          <h2 className="text-3xl font-bold text-yellow-400">
            Backup History
          </h2>

          {backups.length === 0 ? (
            <p className="mt-8 text-gray-500">
              No backup records.
            </p>
          ) : (
            <div className="mt-8 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-yellow-500/20 text-left">
                    <th className="py-4">File Name</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {backups.map((backup) => (
                    <tr
                      key={backup.id}
                      className="border-b border-yellow-500/10"
                    >
                      <td className="py-4">
                        {backup.filename}
                      </td>

                      <td>{backup.type}</td>

                      <td>{backup.size} KB</td>

                      <td className="text-green-400">
                        {backup.status}
                      </td>

                      <td>
                        {new Date(
                          backup.createdAt
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}