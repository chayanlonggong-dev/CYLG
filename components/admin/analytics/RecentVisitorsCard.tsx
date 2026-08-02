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

            <div className="mt-2 text-sm text-gray-400">
              {visitor.country || "-"} ·{" "}
              {visitor.browser || "-"} ·{" "}
              {visitor.device || "-"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}