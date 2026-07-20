"use client";

import { useLanguage } from "@/app/providers/LanguageProvider";

export default function LuxuryExperience() {
  const { messages } = useLanguage();

  return (
    <section className="bg-black px-6 py-24">
      <div className="mx-auto max-w-7xl text-center">
        <p className="mb-4 uppercase tracking-[0.35em] text-yellow-500">
          WHY CHOOSE CYLG
        </p>

        <h2 className="text-5xl font-bold text-white">
          {messages.luxury.title}
        </h2>

        <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-gray-400">
          {messages.luxury.subtitle}
        </p>
      </div>

      <div className="mx-auto mt-20 grid max-w-7xl gap-8 md:grid-cols-3">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10">
          <h3 className="mb-4 text-2xl font-bold text-yellow-400">
            {messages.luxury.worldwide}
          </h3>

          <p className="leading-8 text-gray-400">
            {messages.luxury.worldwideDesc}
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10">
          <h3 className="mb-4 text-2xl font-bold text-yellow-400">
            {messages.luxury.vip}
          </h3>

          <p className="leading-8 text-gray-400">
            {messages.luxury.vipDesc}
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10">
          <h3 className="mb-4 text-2xl font-bold text-yellow-400">
            {messages.luxury.privacy}
          </h3>

          <p className="leading-8 text-gray-400">
            {messages.luxury.privacyDesc}
          </p>
        </div>
      </div>
    </section>
  );
}