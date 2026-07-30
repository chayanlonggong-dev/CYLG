"use client";

interface DashboardStatsProps {
  totalModels: number;
  crownCount?: number;
  sssCount?: number;
  ssCount?: number;
  sCount?: number;
  aCount?: number;
  onlineModels?: number;
  offlineModels?: number;
  loading: boolean;
}

export default function DashboardStats({
  totalModels,
  crownCount = 0,
  sssCount = 0,
  ssCount = 0,
  sCount = 0,
  aCount = 0,
  onlineModels = 0,
  offlineModels = 0,
  loading,
}: DashboardStatsProps) {
  const cards = [
    {
      title: "Total Models",
      value: totalModels,
      subtitle: "Profiles in CMS",
    },
    {
      title: "CROWN",
      value: crownCount,
      subtitle: "CROWN level profiles",
    },
    {
      title: "SSS",
      value: sssCount,
      subtitle: "SSS level profiles",
    },
    {
      title: "SS",
      value: ssCount,
      subtitle: "SS level profiles",
    },
    {
      title: "S",
      value: sCount,
      subtitle: "S level profiles",
    },
    {
      title: "A",
      value: aCount,
      subtitle: "A level profiles",
    },
    {
      title: "Online Models",
      value: onlineModels,
      subtitle: "Currently online",
    },
    {
      title: "Offline Models",
      value: offlineModels,
      subtitle: "Currently offline",
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

          <p className="mt-4 text-gray-400">{card.subtitle}</p>
        </div>
      ))}
    </section>
  );
}
