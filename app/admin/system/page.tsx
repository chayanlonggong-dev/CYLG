export default function SystemPage() {
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
              Online
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-xl font-bold text-yellow-400">
              Database
            </h2>

            <p className="mt-6 text-4xl font-black text-green-400">
              Connected
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-xl font-bold text-yellow-400">
              Storage
            </h2>

            <p className="mt-6 text-4xl font-black">
              -- GB
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-xl font-bold text-yellow-400">
              Version
            </h2>

            <p className="mt-6 text-4xl font-black">
              v1.0.0
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}