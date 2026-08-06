"use client";

import { useRef, useState } from "react";

type VerifyResult = {
  version: string;
  application: string;
  database: string;
  schema: string;
  exportedAt: string;

  models: number;
  websiteSettings: number;
  adminUsers: number;
  sessions: number;
  auditLogs: number;
  analytics: number;
};

export default function RestoreBackupCard() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);

  const [fileName, setFileName] = useState("");

  const [result, setResult] =
    useState<VerifyResult | null>(null);

  async function verifyBackup(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFileName(file.name);

    setLoading(true);

    setResult(null);

    try {
      const text = await file.text();

      const json = JSON.parse(text);

      const response = await fetch(
        "/api/admin/backups/restore",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(json),
        }
      );

      const data = await response.json();

      if (!data.success) {
        alert(data.message);

        setLoading(false);

        return;
      }

      setResult(data.info);
    } catch (error) {
      console.error(error);

      alert("Invalid backup file.");
    }

    setLoading(false);
  }

  return (
    <div
      className="
        rounded-3xl
        border
        border-yellow-500/20
        bg-[#101010]
        p-8
      "
    >
      <h2
        className="
          text-2xl
          font-bold
          text-yellow-400
        "
      >
        Restore Backup
      </h2>

      <p
        className="
          mt-4
          text-gray-400
        "
      >
        Select a backup JSON file and verify
        it before restoring.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={verifyBackup}
      />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="
          mt-8
          rounded-full
          border
          border-yellow-500
          px-8
          py-3
          font-bold
          text-yellow-500
          transition
          hover:bg-yellow-500
          hover:text-black
          disabled:opacity-50
        "
      >
        {loading
          ? "Verifying..."
          : "Choose Backup File"}
      </button>

      {fileName && (
        <p
          className="
            mt-6
            text-sm
            text-gray-400
          "
        >
          Selected File:

          <span
            className="
              ml-2
              text-yellow-400
            "
          >
            {fileName}
          </span>
        </p>
      )}

      {result && (
        <div
          className="
            mt-8
            rounded-2xl
            border
            border-green-500/20
            bg-black/30
            p-6
          "
        >
          <h3
            className="
              text-xl
              font-bold
              text-green-400
            "
          >
            Backup Verified
          </h3>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">

            <div>
              <p className="text-gray-400">
                Version
              </p>

              <p className="font-bold text-white">
                {result.version}
              </p>
            </div>

            <div>
              <p className="text-gray-400">
                Application
              </p>

              <p className="font-bold text-white">
                {result.application}
              </p>
            </div>

            <div>
              <p className="text-gray-400">
                Database
              </p>

              <p className="font-bold text-white">
                {result.database}
              </p>
            </div>

            <div>
              <p className="text-gray-400">
                Schema
              </p>

              <p className="font-bold text-white">
                {result.schema}
              </p>
            </div>

            <div>
              <p className="text-gray-400">
                Export Time
              </p>

              <p className="font-bold text-white">
                {new Date(
                  result.exportedAt
                ).toLocaleString()}
              </p>
            </div>

          </div>

          <div className="mt-8">

            <h4 className="mb-4 text-lg font-bold text-yellow-400">
              Backup Statistics
            </h4>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">

              <div className="rounded-xl bg-[#181818] p-4">
                Models
                <div className="mt-2 text-2xl font-black">
                  {result.models}
                </div>
              </div>

              <div className="rounded-xl bg-[#181818] p-4">
                Website Settings
                <div className="mt-2 text-2xl font-black">
                  {result.websiteSettings}
                </div>
              </div>

              <div className="rounded-xl bg-[#181818] p-4">
                Admin Users
                <div className="mt-2 text-2xl font-black">
                  {result.adminUsers}
                </div>
              </div>

              <div className="rounded-xl bg-[#181818] p-4">
                Sessions
                <div className="mt-2 text-2xl font-black">
                  {result.sessions}
                </div>
              </div>

              <div className="rounded-xl bg-[#181818] p-4">
                Audit Logs
                <div className="mt-2 text-2xl font-black">
                  {result.auditLogs}
                </div>
              </div>

              <div className="rounded-xl bg-[#181818] p-4">
                Analytics
                <div className="mt-2 text-2xl font-black">
                  {result.analytics}
                </div>
              </div>

            </div>

            <button
              disabled
              className="
                mt-8
                rounded-full
                bg-green-600
                px-8
                py-3
                font-bold
                text-white
                opacity-50
                cursor-not-allowed
              "
            >
              Restore Database
              (Coming Soon)
            </button>

          </div>

        </div>
      )}

    </div>
  );
}