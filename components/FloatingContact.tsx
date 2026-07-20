"use client";

import { useLanguage } from "@/app/providers/LanguageProvider";

interface FloatingContactProps {
  onOpen: () => void;
  email?: string;
  showFeedback?: boolean;
}

export default function FloatingContact({
  onOpen,
  email,
  showFeedback = false,
}: FloatingContactProps) {
  const { messages } = useLanguage();

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
      <button
        onClick={onOpen}
        className="
          rounded-full
          border
          border-yellow-500
          bg-[#101010]
          px-7
          py-4
          text-sm
          font-semibold
          uppercase
          tracking-[0.25em]
          text-yellow-400
          shadow-2xl
          transition-all
          duration-300
          hover:scale-105
          hover:bg-yellow-500
          hover:text-black
        "
      >
        {messages.contact.title}
      </button>

      {showFeedback && email && (
        <a
          href={`mailto:${email}`}
          className="
            text-[11px]
            uppercase
            tracking-[0.35em]
            text-yellow-500
            transition
            hover:text-yellow-400
          "
        >
          {messages.contact.feedback}
        </a>
      )}
    </div>
  );
}