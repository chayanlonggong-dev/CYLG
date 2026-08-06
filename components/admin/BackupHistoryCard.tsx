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

export default function BackupHistoryCard() {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadBackups() {
    try {
      const response = await fetch("/api/admin/backups");
      const result = await response.json();

      if (result.success) {
        setBackups(Array.isArray(result.data) ? result.data : []);
      } else {
        setBackups([]);
      }
    } catch (error) {
      console.error(error);
      setBackups([]);
      alert("Failed to load backups.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteBackup(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this backup record?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/backups/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        await loadBackups();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete backup.");
    }
  }

  function downloadBackup(id: string) {
    window.open(`/api/admin/backups/${id}/download`, "_blank");
  }

  useEffect(() => {
    loadBackups();
  }, []);

  return (
    <div className="mt-16 rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
      <h2 className="text-3xl font-bold text-yellow-400">
        Backup History
      </h2>

      {loading ? (
        <p className="mt-8 text-gray-500">
          Loading...
        </p>
      ) : backups.length === 0 ? (
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
                <th className="text-center">Action</th>
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

                  <td>
                    <div className="flex gap-2 justify-center">

                      <button
                        onClick={() =>
                          downloadBackup(backup.id)
                        }
                        className="rounded-lg border border-yellow-500 px-3 py-1 text-sm text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
                      >
                        Download
                      </button>

                      <button
                        onClick={() =>
                          deleteBackup(backup.id)
                        }
                        className="rounded-lg border border-red-500 px-3 py-1 text-sm text-red-400 transition hover:bg-red-500 hover:text-white"
                      >
                        Delete
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}