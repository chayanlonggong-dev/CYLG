"use client";
import LogDetailsModal from "./LogDetailsModal";
import { useEffect, useState } from "react";

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
export default function LogsTable() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
const [detailsOpen, setDetailsOpen] = useState(false);
  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    try {
      const res = await fetch("/api/admin/logs", {
        cache: "no-store",
      });

      const json = await res.json();

      setLogs(json.data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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
      <table className="w-full">
        <thead className="border-b border-yellow-500/20">
  <tr>
    <th className="px-6 py-4 text-left">Time</th>
    <th className="px-6 py-4 text-left">User</th>
    <th className="px-6 py-4 text-left">Action</th>
    <th className="px-6 py-4 text-left">Description</th>
    <th className="px-6 py-4 text-left">Status</th>
  </tr>
</thead>

        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td
  colSpan={5}
                className="px-6 py-8 text-center text-gray-400"
              >
                No logs available.
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr
  key={log.id}
  onClick={() => {
    console.log("clicked", log);

    setSelectedLog(log);
    setDetailsOpen(true);
  }}
  className="cursor-pointer border-b border-yellow-500/10 transition hover:bg-yellow-500/5"
>
                <td className="px-6 py-4">
  {new Date(log.createdAt).toLocaleString()}
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

<td className="px-6 py-4 text-gray-300">
  {log.description}
</td>

<td className="px-6 py-4">
  <span
    className={
      "inline-flex rounded-full px-3 py-1 text-xs font-semibold " +
      (
        (log.metadata?.result ?? "Success") === "Success"
          ? "bg-green-500/20 text-green-400 border border-green-500/30"
          : (log.metadata?.result ?? "") === "Warning"
          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
          : "bg-red-500/20 text-red-400 border border-red-500/30"
      )
    }
  >
    {log.metadata?.result ?? "Success"}
  </span>
</td>
              </tr>
            ))
          )}
        </tbody>
            </table>
    </div>

    <LogDetailsModal
      open={detailsOpen}
      log={selectedLog}
      onClose={() => {
        setDetailsOpen(false);
        setSelectedLog(null);
      }}
    />
  </>
);
}