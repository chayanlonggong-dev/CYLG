"use client";

import { useEffect, useState } from "react";

export default function BackupSchedulerCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [enabled, setEnabled] = useState(false);
  const [day, setDay] = useState("Sunday");
  const [time, setTime] = useState("03:00");
  const [retention, setRetention] = useState(8);

  async function loadScheduler() {
    try {
      const response = await fetch(
        "/api/admin/backups/scheduler"
      );

      const result = await response.json();

      if (result.success) {
        setEnabled(result.data.enabled);
        setDay(result.data.day);
        setTime(result.data.time);
        setRetention(result.data.retention);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to load scheduler.");
    } finally {
      setLoading(false);
    }
  }

  async function saveScheduler() {
    setSaving(true);

    try {
      const response = await fetch(
        "/api/admin/backups/scheduler",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            enabled,
            day,
            time,
            retention,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert("Backup scheduler saved.");
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save scheduler.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadScheduler();
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
        <p className="text-gray-400">
          Loading scheduler...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">

      <h2 className="text-2xl font-bold text-yellow-400">
        Automatic Backup
      </h2>

      <p className="mt-4 text-gray-400">
        Configure weekly automatic backups.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) =>
            setEnabled(e.target.checked)
          }
          className="h-5 w-5"
        />

        <span className="text-white font-semibold">
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
            onChange={(e) =>
              setDay(e.target.value)
            }
            className="w-full rounded-xl bg-[#181818] p-3 text-white"
          >
            <option>Sunday</option>
            <option>Monday</option>
            <option>Tuesday</option>
            <option>Wednesday</option>
            <option>Thursday</option>
            <option>Friday</option>
            <option>Saturday</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-400">
            Time
          </label>

          <input
            type="time"
            value={time}
            onChange={(e) =>
              setTime(e.target.value)
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
            onChange={(e) =>
              setRetention(Number(e.target.value))
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

    </div>
  );
}