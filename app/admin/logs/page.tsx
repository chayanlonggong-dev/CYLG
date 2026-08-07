import LogsStats from "@/components/admin/logs/LogsStats";
import LogsFilters from "@/components/admin/logs/LogsFilters";
import LogsTable from "@/components/admin/logs/LogsTable";

export default function LogsPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-7xl px-8 py-12">
        <span className="text-sm uppercase tracking-[0.3em] text-yellow-500">
          CYLG CMS
        </span>

        <h1 className="mt-4 text-5xl font-black">
          System Logs
        </h1>

        <p className="mt-4 text-gray-400">
          Audit logs, login history and system events.
        </p>

        <LogsStats />

        <LogsFilters />

        <LogsTable />
      </div>
    </main>
  );
}