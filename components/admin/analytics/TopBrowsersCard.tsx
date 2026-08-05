type Browser = {
  browser: string | null;
  _count: {
    browser: number;
  };
};

type Props = {
  browsers: Browser[];
};

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

export default function TopBrowsersCard({
  browsers,
}: Props) {
  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
      <h2 className="text-2xl font-bold text-yellow-400">
        Top Browsers
      </h2>

      <div className="mt-6 space-y-4">
        {browsers.length === 0 && (
          <p className="text-gray-500">
            No data
          </p>
        )}

        {browsers.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b border-white/10 pb-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">
                {getBrowserIcon(item.browser)}
              </span>

              <span>
                {item.browser || "Unknown"}
              </span>
            </div>

            <span className="font-bold text-yellow-400">
              {item._count.browser}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}