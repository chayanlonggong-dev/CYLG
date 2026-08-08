"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function LogsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [action, setAction] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [range, setRange] = useState("TODAY");

  useEffect(() => {
    setSearch(searchParams.get("q") ?? "");
    setAction(searchParams.get("action") ?? "ALL");
    setStatus(searchParams.get("status") ?? "ALL");
    setRange(searchParams.get("range") ?? "TODAY");
  }, [searchParams]);

  function handleSearch() {
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("q", search.trim());
    }

    if (action !== "ALL") {
      params.set("action", action);
    }

    if (status !== "ALL") {
      params.set("status", status);
    }

    params.set("range", range);

    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function handleReset() {
    setSearch("");
    setAction("ALL");
    setStatus("ALL");
    setRange("TODAY");

    router.push(`${pathname}?range=TODAY`);
  }

  return (
    <div className="mt-8 rounded-3xl border border-yellow-500/20 bg-[#101010] p-6">
      <div className="grid gap-4 lg:grid-cols-5">

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          placeholder="Search logs..."
          className="rounded-xl border border-yellow-500/20 bg-[#050505] px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-yellow-500/50"
        />

        {/* Action */}
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="rounded-xl border border-yellow-500/20 bg-[#050505] px-4 py-3 text-white outline-none focus:border-yellow-500/50"
        >
          <option value="ALL">All Actions</option>
          <option value="LOGIN">LOGIN</option>
          <option value="LOGOUT">LOGOUT</option>
          <option value="CREATE">CREATE</option>
          <option value="CREATE_MODEL">CREATE_MODEL</option>
          <option value="UPDATE">UPDATE</option>
          <option value="EDIT_MODEL">EDIT_MODEL</option>
          <option value="DELETE">DELETE</option>
          <option value="DELETE_MODEL">DELETE_MODEL</option>
          <option value="BATCH_DELETE">BATCH_DELETE</option>
          <option value="SETTINGS_CHANGE">SETTINGS_CHANGE</option>
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-yellow-500/20 bg-[#050505] px-4 py-3 text-white outline-none focus:border-yellow-500/50"
        >
          <option value="ALL">All Status</option>
          <option value="Success">Success</option>
          <option value="Warning">Warning</option>
          <option value="Failed">Failed</option>
        </select>

        {/* Date */}
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="rounded-xl border border-yellow-500/20 bg-[#050505] px-4 py-3 text-white outline-none focus:border-yellow-500/50"
        >
          <option value="TODAY">Today</option>
          <option value="YESTERDAY">Yesterday</option>
          <option value="LAST_7_DAYS">Last 7 Days</option>
          <option value="LAST_30_DAYS">Last 30 Days</option>
          <option value="LAST_90_DAYS">Last 90 Days</option>
          <option value="ALL_TIME">All Time</option>
        </select>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSearch}
            className="flex-1 rounded-xl bg-yellow-500 px-4 py-3 font-semibold text-black transition hover:bg-yellow-400"
          >
            Search
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-yellow-500/20 px-4 py-3 text-gray-300 transition hover:border-yellow-500/50 hover:text-white"
          >
            Reset
          </button>
        </div>

      </div>
    </div>
  );
}