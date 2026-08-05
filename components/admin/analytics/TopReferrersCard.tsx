type Referrer = {
  referrer: string | null;
  _count: {
    referrer: number;
  };
};

type Props = {
  referrers: Referrer[];
};

function getReferrerInfo(referrer: string | null) {
  switch (referrer) {
    case "Google":
      return { icon: "🔍", color: "text-blue-400" };

    case "Bing":
      return { icon: "🟢", color: "text-green-400" };

    case "Yahoo":
      return { icon: "🟣", color: "text-violet-400" };

    case "DuckDuckGo":
      return { icon: "🦆", color: "text-orange-400" };

    case "Facebook":
      return { icon: "📘", color: "text-blue-500" };

    case "Instagram":
      return { icon: "📸", color: "text-pink-400" };

    case "Threads":
      return { icon: "🧵", color: "text-gray-200" };

    case "X":
      return { icon: "✖️", color: "text-white" };

    case "Telegram":
      return { icon: "✈️", color: "text-sky-400" };

    case "WhatsApp":
      return { icon: "💬", color: "text-green-500" };

    case "LINE":
      return { icon: "🟩", color: "text-green-400" };

    case "WeChat":
      return { icon: "💚", color: "text-green-500" };

    case "YouTube":
      return { icon: "▶️", color: "text-red-500" };

    case "TikTok":
      return { icon: "🎵", color: "text-cyan-400" };

    case "Reddit":
      return { icon: "👽", color: "text-orange-500" };

    case "Direct":
      return { icon: "🚪", color: "text-yellow-400" };

    case "Other":
      return { icon: "🌐", color: "text-gray-400" };

    default:
      return { icon: "❓", color: "text-gray-400" };
  }
}

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

        {referrers.map((item, index) => {
          const info = getReferrerInfo(item.referrer);

          return (
            <div
              key={index}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-[#151515] px-4 py-3 transition-all hover:border-yellow-500/30"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {info.icon}
                </span>

                <span className={info.color}>
                  {item.referrer || "Unknown"}
                </span>
              </div>

              <span className="rounded-full bg-yellow-500/10 px-3 py-1 font-bold text-yellow-400">
                {item._count.referrer}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}