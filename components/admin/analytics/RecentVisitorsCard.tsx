type RecentVisitor = {
  createdAt: string;
  path: string;
  country: string | null;
  browser: string | null;
  device: string | null;
};

type Props = {
  visitors: RecentVisitor[];
};

function getCountryIcon(country: string | null) {
  switch (country) {
    case "TH":
      return "🇹🇭";
    case "US":
      return "🇺🇸";
    case "JP":
      return "🇯🇵";
    case "CN":
      return "🇨🇳";
    case "TW":
      return "🇹🇼";
    case "KR":
      return "🇰🇷";
    case "SG":
      return "🇸🇬";
    case "MY":
      return "🇲🇾";
    case "VN":
      return "🇻🇳";
    case "HK":
      return "🇭🇰";
    case "Local Development":
      return "💻";
    default:
      return "🌍";
  }
}

function getBrowserIcon(browser: string | null) {
  switch (browser) {
    case "Chrome":
      return "🌐";

    case "Edge":
      return "🟦";

    case "Safari":
      return "🧭";

    case "Firefox":
      return "🦊";

    case "Opera":
      return "🅾️";

    case "Brave":
      return "🦁";

    case "DuckDuckGo":
      return "🦆";

    case "Samsung Internet":
      return "📱";

    case "Arc":
      return "🌀";

    default:
      return "❓";
  }
}

function getDeviceIcon(device: string | null) {
  switch (device) {
    case "Desktop":
      return "🖥️";

    case "Mobile":
      return "📱";

    case "Tablet":
      return "📲";

    default:
      return "❓";
  }
}

export default function RecentVisitorsCard({
  visitors,
}: Props) {
  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
      <h2 className="text-2xl font-bold text-yellow-400">
        Recent Visitors
      </h2>

      <div className="mt-6 space-y-4">
        {visitors.length === 0 && (
          <p className="text-gray-500">
            No data
          </p>
        )}

        {visitors.map((visitor, index) => (
          <div
            key={index}
            className="rounded-xl border border-white/10 p-4"
          >
            <div className="text-sm text-gray-400">
              {new Date(visitor.createdAt).toLocaleString()}
            </div>

            <div className="mt-2 font-mono text-yellow-400">
              {visitor.path}
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-2">
                <span>{getCountryIcon(visitor.country)}</span>
                <span>{visitor.country || "Unknown"}</span>
              </span>

              <span className="flex items-center gap-2">
                <span>{getBrowserIcon(visitor.browser)}</span>
                <span>{visitor.browser || "Unknown"}</span>
              </span>

              <span className="flex items-center gap-2">
                <span>{getDeviceIcon(visitor.device)}</span>
                <span>{visitor.device || "Unknown"}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}