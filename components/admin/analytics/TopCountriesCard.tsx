type Country = {
  country: string | null;
  _count: {
    country: number;
  };
};

type Props = {
  countries: Country[];
};

function getCountryInfo(country: string | null) {
  switch (country) {
    case "TH":
      return { flag: "🇹🇭", name: "Thailand" };

    case "US":
      return { flag: "🇺🇸", name: "United States" };

    case "JP":
      return { flag: "🇯🇵", name: "Japan" };

    case "CN":
      return { flag: "🇨🇳", name: "China" };

    case "TW":
      return { flag: "🇹🇼", name: "Taiwan" };

    case "KR":
      return { flag: "🇰🇷", name: "South Korea" };

    case "SG":
      return { flag: "🇸🇬", name: "Singapore" };

    case "MY":
      return { flag: "🇲🇾", name: "Malaysia" };

    case "VN":
      return { flag: "🇻🇳", name: "Vietnam" };

    case "HK":
      return { flag: "🇭🇰", name: "Hong Kong" };

    case "Local Development":
      return { flag: "💻", name: "Local Development" };

    case "Unknown":
    case null:
    case "":
      return { flag: "❓", name: "Unknown" };

    default:
      return {
        flag: "🌍",
        name: country,
      };
  }
}

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

        {countries.map((item, index) => {
          const info = getCountryInfo(item.country);

          return (
            <div
              key={index}
              className="flex items-center justify-between border-b border-white/10 pb-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {info.flag}
                </span>

                <span>
                  {info.name}
                </span>
              </div>

              <span className="font-bold text-yellow-400">
                {item._count.country}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}