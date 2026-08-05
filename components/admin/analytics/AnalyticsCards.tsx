type Props = {
  todayPageViews: number;
  yesterdayPageViews: number;
  weekPageViews: number;
  monthPageViews: number;
  totalPageViews: number;
  uniqueVisitors: number;
  onlineVisitors: number;
  growthRate: number;
};

export default function AnalyticsCards({
  todayPageViews,
  yesterdayPageViews,
  weekPageViews,
  monthPageViews,
  totalPageViews,
  uniqueVisitors,
  onlineVisitors,
  growthRate,
}: Props) {
  const cards = [
    {
      title: "Today's Page Views",
      value: todayPageViews,
      icon: "📈",
      color: "text-green-400",
    },
    {
      title: "Yesterday",
      value: yesterdayPageViews,
      icon: "📅",
      color: "text-blue-400",
    },
    {
      title: "This Week",
      value: weekPageViews,
      icon: "📊",
      color: "text-violet-400",
    },
    {
      title: "This Month",
      value: monthPageViews,
      icon: "🗓️",
      color: "text-orange-400",
    },
    {
      title: "Total Page Views",
      value: totalPageViews,
      icon: "🌍",
      color: "text-yellow-400",
    },
    {
      title: "Unique Visitors",
      value: uniqueVisitors,
      icon: "👥",
      color: "text-cyan-400",
    },
    {
      title: "Online Visitors",
      value: onlineVisitors,
      icon: "🟢",
      color: "text-emerald-400",
    },
    {
      title: "Growth Rate",
      value: `${growthRate}%`,
      icon: "🚀",
      color:
        growthRate >= 0
          ? "text-green-400"
          : "text-red-400",
    },
  ];

  return (
    <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="group rounded-3xl border border-yellow-500/20 bg-[#101010] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-yellow-500/50"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-yellow-400">
              {card.title}
            </h2>

            <span className="text-3xl">
              {card.icon}
            </span>
          </div>

          <p className={`mt-6 text-5xl font-black ${card.color}`}>
            {typeof card.value === "number"
              ? card.value.toLocaleString()
              : card.value}
          </p>

          <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-[#1A1A1A]">
            <div className="h-full w-full rounded-full bg-linear-to-r from-yellow-600 via-yellow-500 to-yellow-300" />
          </div>
        </div>
      ))}
    </div>
  );
}