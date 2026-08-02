type Country = {
  country: string | null;
  _count: {
    country: number;
  };
};

type Props = {
  countries: Country[];
};

export default function TopCountriesCard({
  countries,
}: Props) {
  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
      <h2 className="text-2xl font-bold text-yellow-400">
        Top Countries
      </h2>

      <div className="mt-6 space-y-4">
        {countries.length === 0 && (
          <p className="text-gray-500">
            No data
          </p>
        )}

        {countries.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b border-white/10 pb-3"
          >
            <span>
              {item.country || "Unknown"}
            </span>

            <span className="font-bold text-yellow-400">
              {item._count.country}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}