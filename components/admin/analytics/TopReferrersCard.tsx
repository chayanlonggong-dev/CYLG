type Referrer = {
  referrer: string | null;
  _count: {
    referrer: number;
  };
};

type Props = {
  referrers: Referrer[];
};

export default function TopReferrersCard({
  referrers,
}: Props) {
  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
      <h2 className="text-2xl font-bold text-yellow-400">
        Top Referrers
      </h2>

      <div className="mt-6 space-y-4">
        {referrers.length === 0 && (
          <p className="text-gray-500">
            No data
          </p>
        )}

        {referrers.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b border-white/10 pb-3"
          >
            <span>
              {item.referrer || "Unknown"}
            </span>

            <span className="font-bold text-yellow-400">
              {item._count.referrer}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}