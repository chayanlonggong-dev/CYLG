export default function LogsPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-10 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="uppercase tracking-[0.4em] text-yellow-500">
          CYLG CMS
        </p>

        <h1 className="mt-4 text-5xl font-black">
          System Logs
        </h1>

        <p className="mt-4 text-gray-400">
          Audit logs, login history and system events.
        </p>

        <div className="mt-16 rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-yellow-500/20">
                <th className="pb-4">Time</th>
                <th className="pb-4">User</th>
                <th className="pb-4">Action</th>
                <th className="pb-4">Status</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="py-6 text-gray-400">--</td>
                <td className="py-6 text-gray-400">--</td>
                <td className="py-6 text-gray-400">No logs available.</td>
                <td className="py-6 text-green-400">OK</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}