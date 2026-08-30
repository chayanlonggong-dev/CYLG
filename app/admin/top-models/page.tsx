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
    <main className="min-h-screen bg-[#050505] px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs uppercase tracking-[0.4em] text-yellow-500 sm:text-sm">
          CYLG CMS
        </p>

        <h1 className="mt-3 text-3xl font-black sm:mt-4 sm:text-4xl lg:text-5xl">
          Top Models
        </h1>

        <p className="mt-3 text-sm text-gray-400 sm:mt-4 sm:text-base">
          Model Views Ranking
        </p>

        <div className="mt-5 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
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
              className={`rounded-xl border px-3 py-2 text-sm transition sm:px-4 ${
                period === value
                  ? "border-yellow-500 bg-yellow-500 text-black"
                  : "border-yellow-500/20 bg-[#101010] text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6 sm:mt-8">
          <input
            type="text"
            placeholder="Search Model ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-yellow-500/20 bg-[#101010] px-4 py-3 text-white outline-none focus:border-yellow-500 sm:px-5 sm:py-4"
          />
        </div>

        <div className="mt-3 text-sm text-gray-400 sm:mt-4 sm:text-base">
          {filteredModels.length} Models
        </div>

        {/* 表格区域：手机上只在表格内部横向滚动，不会撑开整个页面 */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-yellow-500/20 bg-[#101010] sm:mt-6 sm:rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-480px">
              <thead className="border-b border-yellow-500/20">
                <tr>
                  <th className="w-20 px-4 py-4 text-center text-sm sm:w-24 sm:px-6 sm:py-5">
                    Rank
                  </th>

                  <th className="px-4 py-4 text-left text-sm sm:px-6 sm:py-5">
                    Photo
                  </th>

                  <th className="px-4 py-4 text-left text-sm sm:px-6 sm:py-5">
                    Model
                  </th>

                  <th className="px-4 py-4 text-right text-sm sm:px-6 sm:py-5">
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
                      <td className="px-4 py-3 text-center text-lg font-bold text-yellow-400 sm:px-6 sm:py-4 sm:text-xl">
                        {medal}
                      </td>

                      <td className="px-4 py-3 sm:px-6 sm:py-4">
                        <img
                          src={model.avatar}
                          alt={model.code}
                          className="h-12 w-12 rounded-xl object-cover sm:h-16 sm:w-16"
                        />
                      </td>

                      <td className="px-4 py-3 font-bold text-yellow-400 sm:px-6 sm:py-4">
                        {model.code}
                      </td>

                      <td className="px-4 py-3 text-right text-lg font-bold sm:px-6 sm:py-4 sm:text-xl">
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
          </div>

          {search === "" && totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 px-3 pb-6 sm:mt-8 sm:pb-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded-xl border border-yellow-500/20 px-3 py-2 text-sm disabled:opacity-30 sm:px-4"
              >
                Previous
              </button>

              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => setPage(number)}
                  className={`h-9 w-9 rounded-xl border text-sm sm:h-10 sm:w-10 ${
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
                className="rounded-xl border border-yellow-500/20 px-3 py-2 text-sm disabled:opacity-30 sm:px-4"
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