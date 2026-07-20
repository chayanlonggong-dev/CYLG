export default function LanguagesPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-10 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="uppercase tracking-[0.4em] text-yellow-500">
          CYLG CMS
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Language Management
        </h1>

        <p className="mt-4 text-gray-400">
          Supported Frontend Languages
        </p>

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[
            "🇺🇸 English",
            "🇹🇼 繁體中文",
            "🇨🇳 简体中文",
            "🇯🇵 日本語",
            "🇰🇷 한국어",
          ].map((language) => (
            <div
              key={language}
              className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8"
            >
              <h2 className="text-2xl font-bold text-yellow-400">
                {language}
              </h2>

              <p className="mt-4 text-gray-400">
                Enabled
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}