"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LEVELS = ["CROWN", "SSS", "SS", "S", "A"];

export default function NewModelPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    level: "SS",
    avatar: "",
    introduction: "",
  });

  function update(key: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function save() {
    setLoading(true);

    try {
      await fetch("/api/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      router.push("/admin/models");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-10 text-white">
      <p className="uppercase tracking-[0.35em] text-yellow-500">
        CYLG CMS
      </p>

      <h1 className="mt-3 text-5xl font-black">
        Add New Model
      </h1>

      <div className="mt-10 max-w-3xl rounded-3xl border border-yellow-500/20 bg-[#111111] p-8">

        <label className="mb-3 block text-yellow-400">
          Level
        </label>

        <select
          value={form.level}
          onChange={(e) => update("level", e.target.value)}
          className="mb-8 w-full rounded-xl bg-black p-4"
        >
          {LEVELS.map((level) => (
            <option
              key={level}
              value={level}
            >
              {level}
            </option>
          ))}
        </select>

        <label className="mb-3 block text-yellow-400">
          Avatar
        </label>

        <input
          value={form.avatar}
          onChange={(e) => update("avatar", e.target.value)}
          className="mb-8 w-full rounded-xl bg-black p-4"
        />

        <label className="mb-3 block text-yellow-400">
          Introduction
        </label>

        <textarea
          rows={8}
          value={form.introduction}
          onChange={(e) =>
            update("introduction", e.target.value)
          }
          className="w-full rounded-xl bg-black p-4"
        />

        <button
          onClick={save}
          disabled={loading}
          className="mt-10 rounded-full bg-yellow-500 px-10 py-4 font-bold text-black transition hover:bg-yellow-400 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Model"}
        </button>

      </div>
    </main>
  );
}