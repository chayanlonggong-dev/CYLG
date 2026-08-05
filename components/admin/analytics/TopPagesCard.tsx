type TopPage = {
  path: string;
  _count: {
    path: number;
  };
};

type Props = {
  pages: TopPage[];
};

function getPageIcon(path: string) {
  if (path === "/") return "🏠";

  if (path.includes("/models")) {
    return "👠";
  }

  if (path.includes("/collection")) {
    return "🖼️";
  }

  if (path.includes("/admin")) {
    return "🛠️";
  }

  if (path.includes("/login")) {
    return "🔐";
  }

  if (path.includes("/analytics")) {
    return "📊";
  }

  if (path.includes("/settings")) {
    return "⚙️";
  }

  return "📄";
}

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
            className="flex items-center justify-between rounded-xl border border-white/10 bg-[#151515] px-4 py-3 transition-all hover:border-yellow-500/30"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="text-xl">
                {getPageIcon(page.path)}
              </span>

              <span className="truncate font-mono text-sm text-gray-300">
                {page.path}
              </span>
            </div>

            <span className="rounded-full bg-yellow-500/10 px-3 py-1 font-bold text-yellow-400">
              {page._count.path}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}