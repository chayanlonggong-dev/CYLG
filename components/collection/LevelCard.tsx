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
        relative
        block
        overflow-hidden
        rounded-3xl
        border
        border-yellow-500/20
        bg-gradient-to-br
        from-[#111111]
        to-[#1b1b1b]
        p-5
        transition-all
        duration-500
        hover:-translate-y-2
        hover:border-yellow-400
        hover:bg-[#181818]
        hover:shadow-[0_0_50px_rgba(255,215,0,.18)]
        sm:p-7
        lg:p-8
      "
    >
      <div
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

      <div
        className="
          relative
          z-10
          space-y-4
          sm:space-y-5
          lg:space-y-6
        "
      >
        <h2
          className="
            text-2xl
            font-bold
            text-yellow-500
            sm:text-3xl
          "
        >
          {titleMap[level]}
        </h2>

        <p
          className="
            text-xs
            uppercase
            tracking-[0.25em]
            text-gray-400
            sm:text-sm
          "
        >
          {subtitleMap[level]}
        </p>

        <div className="flex items-end gap-2 sm:gap-3">
          <span
            className="
              text-4xl
              font-black
              text-white
              sm:text-5xl
            "
          >
            {count}
          </span>

          <span
            className="
              pb-1
              text-sm
              text-gray-500
              sm:pb-2
            "
          >
            {messages.collection.profiles}
          </span>
        </div>
      </div>
    </Link>  
  );
}