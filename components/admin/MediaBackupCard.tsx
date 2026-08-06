"use client";

import { useState } from "react";

export default function MediaBackupCard() {
  const [loading, setLoading] = useState(false);

  async function backupMedia() {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/backups/media");

      const result = await response.json();

      if (result.success) {
        alert(
          `Media Scan Completed

Images : ${result.images}
Videos : ${result.videos}
Total : ${result.total}`
        );
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to backup media.");
    }

    setLoading(false);
  }

  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
      <h2 className="text-2xl font-bold text-yellow-400">
        Media Backup
      </h2>

      <p className="mt-4 text-gray-400">
        Backup uploaded images and videos.
      </p>

      <button
        onClick={backupMedia}
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
        {loading ? "Scanning..." : "Backup Media"}
      </button>

      <p className="mt-6 text-sm text-gray-500">
        Export all uploaded images and videos.
      </p>
    </div>
  );
}