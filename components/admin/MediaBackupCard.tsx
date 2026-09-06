"use client";

import { useState } from "react";
import { adminFetch } from "@/lib/admin/adminFetch";

export default function MediaBackupCard() {
  const [loading, setLoading] = useState(false);

  async function backupMedia() {
    setLoading(true);

    try {
      const mediaResponse = await adminFetch("/api/admin/backups/media");
      const mediaResult = await mediaResponse.json();

      if (!mediaResult.success) {
        alert(mediaResult.message);
        setLoading(false);
        return;
      }

      const now = new Date();
      const filename = `CYLG-MEDIA-${now.getFullYear()}${String(
        now.getMonth() + 1
      ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(
        now.getHours()
      ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(
        now.getSeconds()
      ).padStart(2, "0")}`;

      await adminFetch("/api/admin/backups", {
        method: "POST",
        body: JSON.stringify({
          filename,
          type: "Media",
          size: mediaResult.total,
        }),
      });

      alert(
        `Media Backup Completed\n\nImages : ${mediaResult.images}\nVideos : ${mediaResult.videos}\nTotal : ${mediaResult.total}\n\nThis copies local public/ files only, not Cloudinary.`
      );

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to backup media.");
    }

    setLoading(false);
  }

  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
      <h2 className="text-2xl font-bold text-yellow-400">Media Backup</h2>
      <p className="mt-4 text-gray-400">
        Copies images and videos stored in this project public folder.
        Model photos on Cloudinary are kept via Database Backup URLs.
      </p>
      <button
        onClick={backupMedia}
        disabled={loading}
        className="mt-8 rounded-full bg-yellow-500 px-8 py-3 font-bold text-black transition hover:bg-yellow-400 disabled:opacity-50"
      >
        {loading ? "Backing Up..." : "Backup Media"}
      </button>
    </div>
  );
}