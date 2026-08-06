"use client";

import DatabaseBackupCard from "@/components/admin/DatabaseBackupCard";
import MediaBackupCard from "@/components/admin/MediaBackupCard";
import RestoreBackupCard from "@/components/admin/RestoreBackupCard";
import BackupHistoryCard from "@/components/admin/BackupHistoryCard";

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
          <DatabaseBackupCard />

          <MediaBackupCard />

          <RestoreBackupCard />
        </div>

        <BackupHistoryCard />
      </div>
    </main>
  );
}