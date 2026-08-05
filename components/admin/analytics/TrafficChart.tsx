type TrafficItem = {
  date: string;
  views: number;
};

type Props = {
  data: TrafficItem[];
};

export default function TrafficChart({
  data,
}: Props) {
  const maxViews = Math.max(
    ...data.map((item) => item.views),
    1
  );

  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-yellow-400">
          7 Days Traffic
        </h2>

        <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">
          Last 7 Days
        </span>
      </div>

      <div className="mt-8 space-y-5">
        {data.length === 0 && (
          <p className="text-gray-500">
            No data
          </p>
        )}

        {data.map((item) => {
          const percentage =
            (item.views / maxViews) * 100;

          return (
            <div
              key={item.date}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono text-gray-300">
                  {item.date}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {percentage.toFixed(0)}%
                  </span>

                  <span className="font-bold text-yellow-400">
                    {item.views}
                  </span>
                </div>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-[#1A1A1A]">
                <div
                  className="h-full rounded-full bg-linear-to-r from-yellow-600 via-yellow-500 to-yellow-300 transition-all duration-700"
                  style={{
                    width: `${percentage}%`,
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