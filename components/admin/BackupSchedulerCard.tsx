"use client";

import { useEffect, useState } from "react";

interface SchedulerConfig {
  enabled: boolean;
  day: string;
  time: string;
  retention: number;
}

const DEFAULT_CONFIG: SchedulerConfig = {
  enabled: false,
  day: "Sunday",
  time: "03:00",
  retention: 8,
};

export default function BackupSchedulerCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [enabled, setEnabled] = useState(
    DEFAULT_CONFIG.enabled
  );

  const [day, setDay] = useState(
    DEFAULT_CONFIG.day
  );

  const [time, setTime] = useState(
    DEFAULT_CONFIG.time
  );

  const [retention, setRetention] = useState(
    DEFAULT_CONFIG.retention
  );

  const [error, setError] = useState("");

  async function loadScheduler() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/backups/scheduler",
        {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            `Failed to load scheduler (${response.status}).`
        );
      }

      if (
        !result?.success ||
        !result?.data
      ) {
        throw new Error(
          result?.message ||
            "Invalid scheduler response."
        );
      }

      setEnabled(
        Boolean(result.data.enabled)
      );

      setDay(
        typeof result.data.day === "string"
          ? result.data.day
          : DEFAULT_CONFIG.day
      );

      setTime(
        typeof result.data.time === "string"
          ? result.data.time
          : DEFAULT_CONFIG.time
      );

      setRetention(
        Number.isFinite(
          Number(result.data.retention)
        )
          ? Number(result.data.retention)
          : DEFAULT_CONFIG.retention
      );
    } catch (error) {
      console.error(
        "LOAD BACKUP SCHEDULER ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load scheduler."
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveScheduler() {
    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/backups/scheduler",
        {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            enabled,
            day,
            time,
            retention,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            `Failed to save scheduler (${response.status}).`
        );
      }

      if (
        !result?.success ||
        !result?.data
      ) {
        throw new Error(
          result?.message ||
            "Invalid scheduler response."
        );
      }

      setEnabled(
        Boolean(result.data.enabled)
      );

      setDay(
        typeof result.data.day === "string"
          ? result.data.day
          : day
      );

      setTime(
        typeof result.data.time === "string"
          ? result.data.time
          : time
      );

      setRetention(
        Number.isFinite(
          Number(result.data.retention)
        )
          ? Number(result.data.retention)
          : retention
      );

      alert("Backup scheduler saved.");
    } catch (error) {
      console.error(
        "SAVE BACKUP SCHEDULER ERROR:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Failed to save scheduler.";

      setError(message);
      alert(message);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    void loadScheduler();
  }, []);

  if (loading) {
    return (
      <section className="mt-10 rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
        <p className="text-gray-400">
          Loading scheduler...
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10 rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
      <h2 className="text-2xl font-bold text-yellow-400">
        Automatic Backup
      </h2>

      <p className="mt-4 text-gray-400">
        Configure weekly automatic backups.
      </p>

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      <div className="mt-8 flex items-center gap-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) =>
            setEnabled(event.target.checked)
          }
          className="h-5 w-5"
        />

        <span className="font-semibold text-white">
          Enable Weekly Backup
        </span>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm text-gray-400">
            Day
          </label>

          <select
            value={day}
            onChange={(event) =>
              setDay(event.target.value)
            }
            className="w-full rounded-xl bg-[#181818] p-3 text-white"
          >
            <option value="Sunday">
              Sunday
            </option>

            <option value="Monday">
              Monday
            </option>

            <option value="Tuesday">
              Tuesday
            </option>

            <option value="Wednesday">
              Wednesday
            </option>

            <option value="Thursday">
              Thursday
            </option>

            <option value="Friday">
              Friday
            </option>

            <option value="Saturday">
              Saturday
            </option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-400">
            Time
          </label>

          <input
            type="time"
            value={time}
            onChange={(event) =>
              setTime(event.target.value)
            }
            className="w-full rounded-xl bg-[#181818] p-3 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-400">
            Retention
          </label>

          <input
            type="number"
            min={1}
            max={52}
            value={retention}
            onChange={(event) =>
              setRetention(
                Number(event.target.value)
              )
            }
            className="w-full rounded-xl bg-[#181818] p-3 text-white"
          />
        </div>
      </div>

      <button
        onClick={saveScheduler}
        disabled={saving}
        className="mt-10 rounded-full bg-yellow-500 px-8 py-3 font-bold text-black transition hover:bg-yellow-400 disabled:opacity-50"
      >
        {saving
          ? "Saving..."
          : "Save Settings"}
      </button>
    </section>
  );
}