"use client";

import { useCallback, useEffect, useState } from "react";

type Overview = {
  realVisitors: number;
  usVisitors: number;
  otherVisitors: number;
  pageViews: number;
  currentlyOnline: number;
  contactClicks: number;
  potentialLeads: number;
  confirmedBookings: number;
};

type Funnel = {
  visitors?: number;
  engagedVisitors?: number;
  modelViewers?: number;
  contactClicks?: number;
  potentialLeads?: number;
  confirmedBookings?: number;
};

type ContactActivity = {
  platforms: Record<string, number>;
  total: number;
};

type SourceRow = {
  source: string;
  visitors: number;
  pageViews: number;
  modelViews: number;
  contactClicks: number;
  potentialLeads: number;
};

type ModelRow = {
  model: string;
  views: number;
  uniqueVisitors: number;
  usVisitors: number;
  contactClicks: number;
};

type CollectionRow = {
  collection: string;
  visitors: number;
  usVisitors: number;
  views: number;
  contactClicks: number;
};

type RecentUs = {
  visitorId: string;
  country: string;
  time: string;
  device: string;
  browser: string;
  source: string;
  pages: string[];
  durationSeconds: number;
  contact: string | null;
};

type AnalyticsPayload = {
  range: string;
  timezone: string;
  overview: Overview;
  trafficQuality: {
    realHumanVisitors: number;
    realHumanPageViews: number;
    botCrawler: number;
    adminTraffic: number;
    developmentTraffic: number;
    suspiciousTraffic: number;
  };
  customerFunnel: Funnel;
  contactActivity: ContactActivity;
  trafficSources: SourceRow[];
  topModels: ModelRow[];
  topCollections: CollectionRow[];
  recentUsVisitors: RecentUs[];
  countries: { name: string; count: number }[];
  browsers: { name: string; count: number }[];
  devices: { name: string; count: number }[];
};

const RANGES = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last7", label: "Last 7 Days" },
  { key: "last30", label: "Last 30 Days" },
  { key: "thisMonth", label: "This Month" },
  { key: "lastMonth", label: "Last Month" },
];

function Stat({
  label,
  value,
  accent,
  sub,
}: {
  label: string;
  value: string | number;
  accent?: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-yellow-500/15 bg-[#101010] p-3 sm:p-5">
      <p className="text-[10px] uppercase tracking-wider text-gray-500 sm:text-xs">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-black sm:mt-2 sm:text-3xl ${
          accent || "text-yellow-400"
        }`}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {sub && (
        <p className="mt-1 text-[10px] text-gray-500 sm:text-xs">{sub}</p>
      )}
    </div>
  );
}

function FunnelView({
  title,
  steps,
}: {
  title: string;
  steps: { label: string; value: number }[];
}) {
  const max = Math.max(...steps.map((s) => s.value), 1);
  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-6">
      <h2 className="text-xl font-bold text-yellow-400">{title}</h2>
      <div className="mt-6 space-y-3">
        {steps.map((step, i) => (
          <div key={step.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">{step.label}</span>
              <span className="font-bold text-yellow-400">
                {step.value.toLocaleString()}
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#1a1a1a]">
              <div
                className="h-full rounded-full bg-linear-to-r from-yellow-700 via-yellow-500 to-yellow-300"
                style={{ width: `${Math.round((step.value / max) * 100)}%` }}
              />
            </div>
            {i < steps.length - 1 && (
              <div className="py-1 text-center text-gray-600">↓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDuration(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

export default function AnalyticsPage() {
  const [range, setRange] = useState("today");
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`/api/admin/analytics?range=${range}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.message || "Failed to load");
      }
    } catch (e) {
      console.error(e);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    setLoading(true);
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const ov = data?.overview;
  const tq = data?.trafficQuality;
  const funnel = data?.customerFunnel;
  const contact = data?.contactActivity;

  return (
    <main className="min-h-screen bg-[#050505] px-3 py-6 text-white sm:px-6 sm:py-8 md:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs uppercase tracking-[0.4em] text-yellow-500 sm:text-sm">
          CYLG CMS
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-black sm:text-4xl md:text-5xl">
              CYLG Website Analytics
            </h1>
            <p className="mt-2 text-xs text-gray-400 sm:text-sm">
              Worldwide traffic · Asia/Bangkok
            </p>
          </div>
          <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                  range === r.key
                    ? "bg-yellow-500 text-black"
                    : "border border-yellow-500/30 text-yellow-400 hover:border-yellow-500"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {loading && !data && (
          <p className="mt-16 text-center text-gray-500">Loading analytics…</p>
        )}
        {error && (
          <p className="mt-8 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {error}
          </p>
        )}

        {data && ov && (
          <>
            <section className="mt-10">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
                Website Overview · {data.range}
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <Stat label="Real Visitors" value={ov.realVisitors} accent="text-white" />
                <Stat label="US Visitors" value={ov.usVisitors} accent="text-blue-400" />
                <Stat label="Other Countries" value={ov.otherVisitors} />
                <Stat label="Page Views" value={ov.pageViews} />
                <Stat label="Currently Online" value={ov.currentlyOnline} accent="text-emerald-400" />
                <Stat label="Contact Clicks" value={ov.contactClicks} accent="text-green-400" />
                <Stat label="Potential Leads" value={ov.potentialLeads} accent="text-violet-400" />
                <Stat
                  label="Confirmed Bookings"
                  value={ov.confirmedBookings}
                  accent="text-gray-400"
                  sub="Requires booking confirmation event"
                />
              </div>
            </section>

            <section className="mt-10">
              <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-6">
                <h2 className="text-xl font-bold text-yellow-400">Traffic Quality</h2>
                <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
                  <Stat label="Real Human" value={tq?.realHumanVisitors ?? 0} accent="text-emerald-400" />
                  <Stat label="Bot / Crawler" value={tq?.botCrawler ?? 0} accent="text-red-400" />
                  <Stat label="Admin Traffic" value={tq?.adminTraffic ?? 0} />
                  <Stat label="Development" value={tq?.developmentTraffic ?? 0} />
                  <Stat label="Suspicious" value={tq?.suspiciousTraffic ?? 0} />
                </div>
              </div>
            </section>

            <section className="mt-10">
              <FunnelView
                title="Customer Funnel"
                steps={[
                  { label: "Visitors", value: funnel?.visitors ?? 0 },
                  { label: "Engaged Visitors", value: funnel?.engagedVisitors ?? 0 },
                  { label: "Model Viewers", value: funnel?.modelViewers ?? 0 },
                  { label: "Contact Clicks", value: funnel?.contactClicks ?? 0 },
                  { label: "Potential Leads", value: funnel?.potentialLeads ?? 0 },
                  { label: "Confirmed Bookings", value: funnel?.confirmedBookings ?? 0 },
                ]}
              />
            </section>

            <section className="mt-10">
              <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-yellow-400">Contact Activity</h2>
                  <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-bold text-yellow-400">
                    Total {contact?.total ?? 0} clicks
                  </span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {["whatsapp", "telegram", "signal", "line", "wechat"].map((p) => (
                    <div
                      key={p}
                      className="rounded-2xl border border-white/10 bg-[#151515] p-4 text-center"
                    >
                      <p className="text-sm capitalize text-gray-400">{p}</p>
                      <p className="mt-2 text-2xl font-black text-yellow-400">
                        {contact?.platforms?.[p] ?? 0}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-10">
              <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-6">
                <h2 className="text-xl font-bold text-yellow-400">Traffic Sources</h2>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-gray-500">
                      <tr>
                        <th className="py-2">Source</th>
                        <th>Visitors</th>
                        <th>Views</th>
                        <th>Contact</th>
                        <th>Leads</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.trafficSources || []).slice(0, 12).map((s) => (
                        <tr key={s.source} className="border-t border-white/5">
                          <td className="py-2 font-medium text-yellow-400">{s.source}</td>
                          <td>{s.visitors}</td>
                          <td>{s.pageViews}</td>
                          <td>{s.contactClicks}</td>
                          <td>{s.potentialLeads}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="mt-10 grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-6">
                <h2 className="text-xl font-bold text-yellow-400">Top Models</h2>
                <div className="mt-4 space-y-3">
                  {(data.topModels || []).map((m) => (
                    <div
                      key={m.model}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-[#151515] px-4 py-3"
                    >
                      <div>
                        <p className="font-bold text-yellow-400">{m.model}</p>
                        <p className="text-xs text-gray-500">
                          Views {m.views} · Unique {m.uniqueVisitors}
                        </p>
                      </div>
                      <p className="text-green-400">💬 {m.contactClicks}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-6">
                <h2 className="text-xl font-bold text-yellow-400">Top Collections</h2>
                <div className="mt-4 space-y-3">
                  {(data.topCollections || []).map((c) => (
                    <div
                      key={c.collection}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-[#151515] px-4 py-3"
                    >
                      <div>
                        <p className="font-bold text-yellow-400">{c.collection}</p>
                        <p className="text-xs text-gray-500">
                          Views {c.views} · Visitors {c.visitors}
                        </p>
                      </div>
                      <p className="text-green-400">💬 {c.contactClicks}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-10">
              <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-6">
                <h2 className="text-xl font-bold text-yellow-400">Recent Visitors</h2>
                <div className="mt-6 space-y-4">
                  {(data.recentUsVisitors || []).map((v, idx) => (
                    <div
                      key={`${v.visitorId}-${idx}`}
                      className="rounded-2xl border border-white/10 bg-[#151515] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">{v.country || ""}</span>
                          <span className="font-mono text-sm text-gray-400">
                            {v.visitorId}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(v.time).toLocaleString("en-GB", {
                              timeZone: "Asia/Bangkok",
                            })}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">
                          {v.device} · {v.browser}
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="text-gray-500">Source:</span>{" "}
                        <span className="text-yellow-400">{v.source}</span>
                        <span className="mx-2 text-gray-600">·</span>
                        {formatDuration(v.durationSeconds)}
                      </div>
                      {v.pages?.length > 0 && (
                        <div className="mt-2 break-all font-mono text-[11px] text-gray-400">
                          {v.pages.join(" → ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-10 grid gap-6 lg:grid-cols-3">
              {[
                { title: "Countries — Page Views", rows: data.countries },
                { title: "Browsers — Page Views", rows: data.browsers },
                { title: "Devices — Page Views", rows: data.devices },
              ].map((block) => (
                <div
                  key={block.title}
                  className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-6"
                >
                  <h2 className="text-lg font-bold text-yellow-400">{block.title}</h2>
                  <ul className="mt-4 space-y-2 text-sm">
                    {(block.rows || []).map((r) => (
                      <li
                        key={r.name}
                        className="flex justify-between border-b border-white/5 py-1"
                      >
                        <span className="text-gray-300">{r.name}</span>
                        <span className="font-bold text-yellow-400">{r.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </main>
  );
}