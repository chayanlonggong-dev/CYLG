"use client";

import { useState } from "react";

export default function DatabaseBackupCard() {
  const [loading, setLoading] = useState(false);

  async function createBackup() {
    setLoading(true);

    try {
      // ① 保存 Backup 到 backup/database/
      const saveResponse = await fetch(
        "/api/admin/backups/save",
        {
          method: "POST",
        }
      );

      const saveResult = await saveResponse.json();

      if (!saveResult.success) {
        alert(saveResult.message);
        setLoading(false);
        return;
      }

      // ② 下载 JSON
      window.open(
        "/api/admin/backups/export",
        "_blank"
      );

      alert(
        `Database Backup Completed

File :
${saveResult.filename}

Size :
${saveResult.size} KB

Checksum :
${saveResult.checksum.substring(0, 16)}...`
      );

      // ③ 刷新 Backup History
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error(error);

      alert("Failed to create backup.");
    } finally {
      setLoading(false);
    }
  }

  return (
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
        className="
          mt-8
          rounded-full
          bg-yellow-500
          px-8
          py-3
          font-bold
          text-black
          transition
          hover:bg-yellow-400
          disabled:opacity-50
        "
      >
        {loading ? "Backing Up..." : "Backup Now"}
      </button>

      <p className="mt-6 text-sm text-gray-500">
        Save a database backup, create a history record,
        and export the backup as a JSON file.
      </p>
    </div>
  );
}