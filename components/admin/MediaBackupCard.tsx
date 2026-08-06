"use client";

import { useState } from "react";

export default function MediaBackupCard() {
  const [loading, setLoading] = useState(false);

  async function backupMedia() {
    setLoading(true);

    try {
      // ① 执行 Media Backup
      const mediaResponse = await fetch(
        "/api/admin/backups/media"
      );

      const mediaResult = await mediaResponse.json();

      if (!mediaResult.success) {
        alert(mediaResult.message);
        setLoading(false);
        return;
      }

      // ② 建立 Backup History 记录
      const now = new Date();

      const filename =
        `CYLG-MEDIA-${
          now.getFullYear()
        }${
          String(now.getMonth() + 1).padStart(2, "0")
        }${
          String(now.getDate()).padStart(2, "0")
        }-${
          String(now.getHours()).padStart(2, "0")
        }${
          String(now.getMinutes()).padStart(2, "0")
        }${
          String(now.getSeconds()).padStart(2, "0")
        }`;

      await fetch("/api/admin/backups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename,
          type: "Media",
          size: mediaResult.total,
        }),
      });

      alert(
        `Media Backup Completed

Images : ${mediaResult.images}
Videos : ${mediaResult.videos}
Total : ${mediaResult.total}`
      );

      // ③ 自动刷新页面，让 History 出现新纪录
      window.location.reload();
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
        className="mt-8 rounded-full bg-yellow-500 px-8 py-3 font-bold text-black transition hover:bg-yellow-400 disabled:opacity-50"
      >
        {loading ? "Backing Up..." : "Backup Media"}
      </button>

      <p className="mt-6 text-sm text-gray-500">
        Export all uploaded images and videos.
      </p>
    </div>
  );
}