"use client";
import { useState } from "react";
export default function DatabaseBackupCard() {
  const [loading, setLoading] = useState(false);
  async function createBackup() {
  setLoading(true);

  const now = new Date();

  const filename = `CYLG-DB-${
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
  }.json`;

  try {
    const response = await fetch("/api/admin/backups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename,
        type: "Database",
        size: 0,
      }),
    });

    const result = await response.json();

    if (result.success) {
  window.open("/api/admin/backups/export", "_blank");

  setTimeout(() => {
    window.location.reload();
  }, 500);
}
  } catch (error) {
    console.error(error);
    alert("Failed to create backup.");
  }

  finally {
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
        A backup record will be created and the
        database will be exported as a JSON file.
      </p>
    </div>
  );
}