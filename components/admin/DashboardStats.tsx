"use client";

interface DashboardStatsProps {
  totalModels: number;
  onlineModels: number;
  featuredModels: number;
  totalLevels: number;
  loading: boolean;
}

export default function DashboardStats({
  totalModels,
  onlineModels,
  featuredModels,
  totalLevels,
  loading,
}: DashboardStatsProps) {
  const cards = [
    {
      title: "Models",
      value: totalModels,
      subtitle: "Total Profiles",
    },
    {
      title: "Online",
      value: onlineModels,
      subtitle: "Currently Online",
    },
    {
      title: "Featured",
      value: featuredModels,
      subtitle: "Featured Profiles",
    },
    {
      title: "Collections",
      value: totalLevels,
      subtitle: "Model Levels",
    },
  ];

  return (
    <section className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-3xl border border-yellow-500/20 bg-[#111111] p-8 transition duration-300 hover:border-yellow-500/50"
        >
          <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
            {card.title}
          </p>

          <h2 className="mt-5 text-5xl font-black text-white">
            {loading ? "—" : card.value}
          </h2>

          <p className="mt-4 text-gray-400">
            {card.subtitle}
          </p>
        </div>
      ))}
    </section>  );
}