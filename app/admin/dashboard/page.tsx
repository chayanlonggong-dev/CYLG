"use client";

import { useEffect, useMemo, useState } from "react";

import { LEVELS } from "@/app/data/options";

type ModelSummary = {
  id: number;
  level: string;
  online: boolean;
  featured: boolean;
};

export default function DashboardPage() {
  const [models, setModels] = useState<ModelSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadModels() {
      try {
        const response = await fetch("/api/models");
        const data = await response.json();
        setModels(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setModels([]);
      } finally {
        setLoading(false);
      }
    }

    loadModels();
  }, []);

  const stats = useMemo(() => {
    const totalByLevel = LEVELS.map((level) => ({
      level,
      count: models.filter((model) => model.level === level).length,
    }));

    return {
      totalModels: models.length,
      onlineModels: models.filter((model) => model.online).length,
      featuredModels: models.filter((model) => model.featured).length,
      totalByLevel,
    };
  }, [models]);

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-yellow-500/20 bg-[#101010]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">CYLG ADMIN</p>
            <h1 className="mt-2 text-3xl font-black">Dashboard</h1>
          </div>

          <button className="rounded-full border border-yellow-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-yellow-500 transition hover:bg-yellow-500 hover:text-black">
            Logout
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-8 py-12">
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-yellow-500/20 bg-[#111111] p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-500">Models</p>
            <h2 className="mt-5 text-5xl font-black">{loading ? "—" : stats.totalModels}</h2>
            <p className="mt-4 text-gray-400">Total profiles</p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#111111] p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-500">Online</p>
            <h2 className="mt-5 text-5xl font-black">{loading ? "—" : stats.onlineModels}</h2>
            <p className="mt-4 text-gray-400">Currently live</p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#111111] p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-500">Featured</p>
            <h2 className="mt-5 text-5xl font-black">{loading ? "—" : stats.featuredModels}</h2>
            <p className="mt-4 text-gray-400">Pinned profiles</p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#111111] p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-500">Levels</p>
            <h2 className="mt-5 text-5xl font-black">{loading ? "—" : stats.totalByLevel.length}</h2>
            <p className="mt-4 text-gray-400">Collections tracked</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-8 pb-16">
        <div className="rounded-3xl border border-yellow-500/20 bg-[#111111] p-10">
          <h2 className="text-3xl font-black">Level Breakdown</h2>
          <p className="mt-3 text-gray-400">Live counts across each collection.</p>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {stats.totalByLevel.map((item) => (
              <div key={item.level} className="rounded-2xl border border-yellow-500/20 bg-[#181818] p-6">
                <p className="text-sm uppercase tracking-[0.25em] text-yellow-500">{item.level}</p>
                <p className="mt-4 text-4xl font-black text-white">{item.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}