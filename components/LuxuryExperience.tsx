"use client";

import { useLanguage } from "@/app/providers/LanguageProvider";

export default function LuxuryExperience() {
  const { messages } = useLanguage();

  return (
    <section className="bg-black px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-6xl text-center">
        <p className="mb-4 uppercase tracking-[0.35em] text-yellow-500">
          WHY CHOOSE CYLG
        </p>

        <h2 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
          {messages.luxury.title}
        </h2>

        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-gray-400">
          {messages.luxury.subtitle}
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-6xl gap-6 md:grid-cols-3 md:gap-8">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
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