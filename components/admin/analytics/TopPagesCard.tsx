type TopPage = {
  path: string;
  _count: {
    path: number;
  };
};

type Props = {
  pages: TopPage[];
};

export default function TopPagesCard({
  pages,
}: Props) {
  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
      <h2 className="text-2xl font-bold text-yellow-400">
        Top Pages
      </h2>

      <div className="mt-6 space-y-4">
        {pages.length === 0 && (
          <p className="text-gray-500">
            No data
          </p>
        )}

        {pages.map((page) => (
          <div
            key={page.path}
            className="flex items-center justify-between border-b border-white/10 pb-3"
          >
            <span className="font-mono text-sm">
              {page.path}
            </span>

            <span className="font-bold text-yellow-400">
              {page._count.path}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}