"use client";

interface ActivityChartProps {
  totalModels: number;
  onlineModels: number;
  featuredModels: number;
}

export default function ActivityChart({
  totalModels,
  onlineModels,
  featuredModels,
}: ActivityChartProps) {
  const offlineModels = Math.max(
    totalModels - onlineModels,
    0
  );

  const maxValue = Math.max(
    totalModels,
    onlineModels,
    featuredModels,
    offlineModels,
    1
  );

  const bars = [
    {
      label: "Models",
      value: totalModels,
    },
    {
      label: "Online",
      value: onlineModels,
    },
    {
      label: "Offline",
      value: offlineModels,
    },
    {
      label: "Featured",
      value: featuredModels,
    },
  ];

  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-[#111111] p-8">
      <h2 className="text-2xl font-black text-white">
        Dashboard Overview
      </h2>

      <p className="mt-3 text-gray-400">
        Current CMS statistics overview.
      </p>

      <div className="mt-10 flex h-72 items-end justify-between gap-6">
        {bars.map((bar) => (
          <div
            key={bar.label}
            className="flex flex-1 flex-col items-center"
          >
            <span className="mb-3 text-lg font-bold text-white">
              {bar.value}
            </span>

            <div className="flex h-52 w-full items-end">
              <div
                className="w-full rounded-t-2xl bg-yellow-500 transition-all duration-500"
                style={{
                  height: `${(bar.value / maxValue) * 100}%`,
                }}
              />
            </div>

            <span className="mt-4 text-xs uppercase tracking-[0.25em] text-gray-400">
              {bar.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}