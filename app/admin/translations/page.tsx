export default function TranslationPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-10 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="uppercase tracking-[0.4em] text-yellow-500">
          CYLG CMS
        </p>

        <h1 className="mt-4 text-5xl font-black text-white">
          Translation Center
        </h1>

        <p className="mt-4 text-gray-400">
          Manage all website translations in one place.
        </p>

        <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-2xl font-bold text-yellow-400">
              Website Text
            </h2>

            <p className="mt-4 text-gray-400">
              Header, Hero, Collection, Footer...
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-2xl font-bold text-yellow-400">
              Model Introduction
            </h2>

            <p className="mt-4 text-gray-400">
              English / 繁體 / 简体 / 日本語 / 한국어
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-[#101010] p-8">
            <h2 className="text-2xl font-bold text-yellow-400">
              AI Translation
            </h2>

            <p className="mt-4 text-gray-400">
              One-click translation for all languages.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}