"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/app/providers/LanguageProvider";

interface ModelInfoProps {
  age: number;
  height: number;
  weight: number;
  city: string;
  nationality: string;
  languages: string[];
  introduction: string;
}

const COLLAPSED_LINES = 8;

export default function ModelInfo({
  age,
  height,
  weight,
  city,
  nationality,
  languages,
  introduction,
}: ModelInfoProps) {
  const { messages } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const profile = useMemo(() => {
    const text =
      introduction?.trim() ||
      "Exclusive luxury companion service.";

    return text;
  }, [introduction]);

  const shouldShowToggle = useMemo(() => {
    return profile.split("\n").length > COLLAPSED_LINES;
  }, [profile]);

  return (
    <section className="bg-black px-6 py-32 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 text-center">
          <p className="text-sm uppercase tracking-[0.6em] text-yellow-400">
            {messages.model.title}
          </p>

          <h2 className="mt-6 text-5xl font-black md:text-6xl">
            {messages.model.title}
          </h2>

          <div className="mx-auto mt-8 h-[2px] w-32 bg-yellow-400" />
        </div>

        <div className="grid gap-20 lg:grid-cols-[360px_1fr]">
          {/* Left */}
          <div className="space-y-8">
            <InfoItem
              label={messages.model.age}
              value={age}
            />

            <InfoItem
              label={messages.model.height}
              value={`${height} cm`}
            />

            <InfoItem
              label={messages.model.weight}
              value={`${weight} kg`}
            />

            <InfoItem
              label={messages.model.location}
              value={city || "-"}
            />

            <InfoItem
              label={messages.model.nationality}
              value={nationality || "-"}
            />
          </div>

          {/* Right */}
          <div>
            <h3 className="mb-8 text-sm uppercase tracking-[0.5em] text-yellow-400">
              {messages.model.aboutHer}
            </h3>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                expanded ? "" : "line-clamp-8"
              }`}
            >
              <p className="whitespace-pre-wrap text-lg leading-9 text-gray-300">
                {profile}
              </p>
            </div>

            {shouldShowToggle && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-8 text-sm font-semibold tracking-[0.25em] text-yellow-400 transition hover:text-yellow-300"
              >
                {expanded
                  ? `▲ ${messages.model.collapseProfile}`
                  : `▼ ${messages.model.readFullProfile}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-5">
      <span className="text-sm uppercase tracking-[0.35em] text-gray-400">
        {label}
      </span>

      <span className="text-right text-lg font-semibold text-white">
        {value}
      </span>
    </div>
  );
}