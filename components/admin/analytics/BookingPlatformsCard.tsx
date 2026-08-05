type BookingPlatform = {
  referrer: string | null;
  _count: {
    referrer: number;
  };
};

type Props = {
  bookingPlatforms: BookingPlatform[];
};

function getPlatformInfo(platform: string | null) {
  switch (platform) {
    case "WhatsApp":
      return {
        icon: "💬",
        color: "text-green-500",
      };

    case "Telegram":
      return {
        icon: "✈️",
        color: "text-sky-400",
      };

    case "LINE":
      return {
        icon: "🟩",
        color: "text-green-400",
      };

    case "WeChat":
      return {
        icon: "💚",
        color: "text-green-500",
      };

    case "Signal":
      return {
        icon: "🟦",
        color: "text-blue-400",
      };

    default:
      return {
        icon: "🌐",
        color: "text-gray-400",
      };
  }
}

export default function BookingPlatformsCard({
  bookingPlatforms,
}: Props) {
  const total = bookingPlatforms.reduce(
    (sum, item) => sum + item._count.referrer,
    0
  );

  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-yellow-400">
          Booking Platforms
        </h2>

        <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-bold text-yellow-400">
          {total} Bookings
        </span>
      </div>

      <div className="mt-6 space-y-5">
        {bookingPlatforms.length === 0 && (
          <p className="text-gray-500">
            No booking data
          </p>
        )}

        {bookingPlatforms.map((item, index) => {
          const info = getPlatformInfo(item.referrer);

          const percent =
            total === 0
              ? 0
              : Math.round(
                  (item._count.referrer / total) * 100
                );

          return (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-[#151515] p-4 transition-all hover:border-yellow-500/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {info.icon}
                  </span>

                  <div>
                    <p className={`font-bold ${info.color}`}>
                      {item.referrer ?? "Unknown"}
                    </p>

                    <p className="text-sm text-gray-500">
                      {percent}% of total bookings
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-black text-yellow-400">
                    {item._count.referrer}
                  </p>

                  <p className="text-xs text-gray-500">
                    Clicks
                  </p>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#242424]">
                <div
                  className="h-full rounded-full bg-linear-to-r from-yellow-700 via-yellow-500 to-yellow-300 transition-all duration-500"
                  style={{
                    width: `${percent}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}