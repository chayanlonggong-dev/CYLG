export default function AITranslationPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-10 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="uppercase tracking-[0.4em] text-yellow-500">
          CYLG CMS
        </p>

        <h1 className="mt-4 text-5xl font-black">
          AI Translation
        </h1>

        <p className="mt-4 text-gray-400">
          Translate all model introductions with one click.
        </p>

        <div className="mt-16 rounded-3xl border border-yellow-500/20 bg-[#101010] p-10">
          <button
            className="
              rounded-full
              bg-yellow-500
              px-10
              py-4
              font-bold
              text-black
              transition
              hover:bg-yellow-400
            "
          >
            Translate All Models
          </button>

          <p className="mt-8 text-gray-500">
            English → 繁體中文 → 简体中文 → 日本語 → 한국어
          </p>
        </div>
      </div>
    </main>
  );
}