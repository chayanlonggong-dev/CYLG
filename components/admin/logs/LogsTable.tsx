"use client";

import LogDetailsModal from "./LogDetailsModal";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type AuditLog = {
  id: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  userId: string | null;
  description: string;
  metadata: {
    operator?: string;
    result?: string;
    modelCode?: string;
    actionLabel?: string;
    ip?: string;
    browser?: string;
    os?: string;
    device?: string;
  } | null;
  createdAt: string;
};

function getActionColor(action: string) {
  switch (action) {
    case "LOGIN":
      return "bg-blue-500/20 text-blue-400 border border-blue-500/30";

    case "LOGOUT":
      return "bg-gray-500/20 text-gray-300 border border-gray-500/30";

    case "CREATE":
    case "CREATE_MODEL":
      return "bg-green-500/20 text-green-400 border border-green-500/30";

    case "UPDATE":
    case "EDIT_MODEL":
    case "SETTINGS_CHANGE":
      return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";

    case "DELETE":
    case "DELETE_MODEL":
    case "BATCH_DELETE":
      return "bg-red-500/20 text-red-400 border border-red-500/30";

    default:
      return "bg-white/10 text-white border border-white/10";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "Success":
      return "bg-green-500/20 text-green-400 border border-green-500/30";

    case "Warning":
      return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";

    case "Failed":
      return "bg-red-500/20 text-red-400 border border-red-500/30";

    default:
      return "bg-white/10 text-white border border-white/10";
  }
}

export default function LogsTable() {
  const searchParams = useSearchParams();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedLog, setSelectedLog] =
    useState<AuditLog | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    loadLogs();
  }, [searchParams]);

  async function loadLogs() {
    try {
      setLoading(true);

      const query = searchParams.toString();

      const url = query
        ? `/api/admin/logs?${query}`
        : "/api/admin/logs?range=TODAY";

      const res = await fetch(url, {
        cache: "no-store",
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.message ?? "Failed to load logs"
        );
      }

      setLogs(json.data ?? []);
    } catch (error) {
      console.error("Load logs error:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  function openDetails(log: AuditLog) {
    setSelectedLog(log);
    setDetailsOpen(true);
  }

  function closeDetails() {
    setDetailsOpen(false);
    setSelectedLog(null);
  }

  if (loading) {
    return (
      <div className="mt-8 rounded-3xl border border-yellow-500/20 bg-[#101010] p-8 text-center text-gray-400">
        Loading logs...
      </div>
    );
  }

  return (
    <>
      <div className="mt-8 overflow-hidden rounded-3xl border border-yellow-500/20 bg-[#101010]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-900px">
            <thead className="border-b border-yellow-500/20">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Time
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  User
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Action
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Description
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    No logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const status =
                    log.metadata?.result ?? "Success";

                  return (
                    <tr
                      key={log.id}
                      onClick={() => openDetails(log)}
                      className="cursor-pointer border-b border-yellow-500/10 transition hover:bg-yellow-500/5"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {new Date(
                          log.createdAt
                        ).toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-white">
                          {log.metadata?.operator ?? "Admin"}
                        </div>

                        <div className="text-xs text-gray-500">
                          ID: {log.userId ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={
                            "inline-flex rounded-full px-3 py-1 text-xs font-semibold " +
                            getActionColor(log.action)
                          }
                        >
                          {log.action}
                        </span>
                      </td>

                      <td className="max-w-md px-6 py-4 text-sm text-gray-300">
                        <div className="truncate">
                          {log.description}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={
                            "inline-flex rounded-full px-3 py-1 text-xs font-semibold " +
                            getStatusColor(status)
                          }
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LogDetailsModal
        open={detailsOpen}
        log={selectedLog}
        onClose={closeDetails}
      />
    </>
  );
}