"use client";

import Link from "next/link";
import { useLanguage } from "@/app/providers/LanguageProvider";

interface LevelCardProps {
  level: "CROWN" | "SSS" | "SS" | "S" | "A";
  count: number;
}

export default function LevelCard({
  level,
  count,
}: LevelCardProps) {
  const { messages } = useLanguage();

  const titleMap = {
    CROWN: `👑 ${messages.collection.crown}`,
    SSS: messages.collection.sss,
    SS: messages.collection.ss,
    S: messages.collection.s,
    A: messages.collection.a,
  };

  const subtitleMap = {
    CROWN: "Ultimate Exclusive",
    SSS: "Elite Selection",
    SS: "Premium Selection",
    S: "Selected Collection",
    A: "Classic Selection",
  };

  return (
    <Link
      href={`/collection/${level}`}
      className="
        group
        block
        rounded-3xl
        overflow-hidden
        border
        border-yellow-500/20
        bg-gradient-to-br
from-[#111111]
to-[#1b1b1b]
        p-10
        transition-all
        duration-700
        hover:-translate-y-3
        hover:border-yellow-400
        hover:shadow-[0_0_50px_rgba(255,215,0,.18)]
        hover:bg-[#181818]
        "
    >
      <div
  className="
    relative
    space-y-6
    z-10
  "
><div
  className="
    absolute
    -right-24
    -top-24
    h-56
    w-56
    rounded-full
    bg-yellow-500/10
    blur-3xl
    opacity-0
    transition-all
    duration-700
    group-hover:opacity-100
  "
/>
        <h2 className="text-3xl font-bold text-yellow-500">
          {titleMap[level]}
        </h2>

        <p className="uppercase tracking-widest text-gray-400">
          {subtitleMap[level]}
        </p>

        <div className="flex items-end gap-3">
          <span className="text-5xl font-black text-white">
            {count}
          </span>

          <span className="pb-2 text-gray-500">
            {messages.collection.profiles}
          </span>
        </div>
      </div>
    </Link>
  );
}