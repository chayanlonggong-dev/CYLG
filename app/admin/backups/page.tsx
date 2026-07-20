export default function BackupsPage() {
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

            <button className="mt-8 rounded-full bg-yellow-500 px-8 py-3 font-bold text-black transition hover:bg-yellow-400">
              Backup Now
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
      </div>
    </main>
  );
}