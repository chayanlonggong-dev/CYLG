"use client";

import { useEffect, useMemo, useState } from "react";

type TopModel = {
  code: string;
  avatar: string;
  level: string;
  views: number;
};

export default function TopModelsPage() {
  const [models, setModels] = useState<TopModel[]>([]);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("all");
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 20;

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
  `/api/admin/top-models?period=${period}`
);
        const result = await res.json();

        if (result.success) {
          setModels(result.data);
        }
      } catch (error) {
        console.error(error);
      }
    }

    load();
  }, [period]);

  const filteredModels = useMemo(() => {
    return models.filter((model) =>
      model.code
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [models, search]);

  const totalPages = Math.ceil(
    filteredModels.length / PAGE_SIZE
  );

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, i) => i + 1
  );

  const paginatedModels = filteredModels.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );
  return (
  <main className="min-h-screen bg-[#050505] px-10 py-10 text-white">
    <div className="mx-auto max-w-7xl">
      <p className="uppercase tracking-[0.4em] text-yellow-500">
        CYLG CMS
      </p>

      <h1 className="mt-4 text-5xl font-black">
        Top Models
      </h1>

      <p className="mt-4 text-gray-400">
        Model Views Ranking
      </p>
<div className="mt-6 flex flex-wrap gap-3">
  {[
    ["today", "Today"],
    ["yesterday", "Yesterday"],
    ["7days", "7 Days"],
    ["30days", "30 Days"],
    ["all", "All Time"],
  ].map(([value, label]) => (
    <button
      key={value}
      onClick={() => setPeriod(value)}
      className={`rounded-xl border px-4 py-2 transition ${
        period === value
          ? "border-yellow-500 bg-yellow-500 text-black"
          : "border-yellow-500/20 bg-[#101010] text-white"
      }`}
    >
      {label}
    </button>
  ))}
</div>
      <div className="mt-8">
        <input
          type="text"
          placeholder="Search Model ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-yellow-500/20 bg-[#101010] px-5 py-4 text-white outline-none focus:border-yellow-500"
        />
      </div>

      <div className="mt-4 text-gray-400">
        {filteredModels.length} Models
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-yellow-500/20 bg-[#101010]">
        <table className="w-full">
          <thead className="border-b border-yellow-500/20">
            <tr>
              <th className="w-24 px-6 py-5 text-center">
                Rank
              </th>

              <th className="px-6 py-5 text-left">
                Photo
              </th>

              <th className="px-6 py-5 text-left">
                Model
              </th>

              <th className="px-6 py-5 text-right">
                Views
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedModels.map((model, index) => {
              const rank = (page - 1) * PAGE_SIZE + index + 1;

              const medal =
                rank === 1
                  ? "🥇"
                  : rank === 2
                  ? "🥈"
                  : rank === 3
                  ? "🥉"
                  : rank;

              return (
                <tr
                  key={model.code}
                  className="border-b border-white/10"
                >
                  <td className="px-6 py-4 text-center text-xl font-bold text-yellow-400">
                    {medal}
                  </td>

                  <td className="px-6 py-4">
                    <img
                      src={model.avatar}
                      alt={model.code}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                  </td>

                  <td className="px-6 py-4 font-bold text-yellow-400">
                    {model.code}
                  </td>

                  <td className="px-6 py-4 text-right text-xl font-bold">
                    {model.views}
                  </td>
                </tr>
              );
            })}

            {filteredModels.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="py-12 text-center text-gray-500"
                >
                  No Data
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {search === "" && totalPages > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 pb-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="rounded-xl border border-yellow-500/20 px-4 py-2 disabled:opacity-30"
            >
              Previous
            </button>

            {pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => setPage(number)}
                className={`h-10 w-10 rounded-xl border ${
                  page === number
                    ? "border-yellow-500 bg-yellow-500 text-black"
                    : "border-yellow-500/20 bg-[#101010] text-white"
                }`}
              >
                {number}
              </button>
            ))}

            <button
              onClick={() =>
                setPage(Math.min(totalPages, page + 1))
              }
              disabled={page === totalPages}
              className="rounded-xl border border-yellow-500/20 px-4 py-2 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  </main>
);
}