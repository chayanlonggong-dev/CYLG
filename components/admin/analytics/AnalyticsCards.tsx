type Props = {
  todayPageViews: number;
  totalPageViews: number;
  uniqueVisitors: number;
  onlineVisitors: number;
};

export default function AnalyticsCards({
  todayPageViews,
  totalPageViews,
  uniqueVisitors,
  onlineVisitors,
}: Props) {
  const cards = [
    {
      title: "Today's Page Views",
      value: todayPageViews,
    },
    {
      title: "Total Page Views",
      value: totalPageViews,
    },
    {
      title: "Unique Visitors",
      value: uniqueVisitors,
    },
    {
      title: "Online Visitors",
      value: onlineVisitors,
    },
  ];

  return (
    <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8"
        >
          <h2 className="text-xl font-bold text-yellow-400">
            {card.title}
          </h2>

          <p className="mt-6 text-5xl font-black">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}