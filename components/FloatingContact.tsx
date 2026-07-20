"use client";

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

          hover:bg-yellow-500
          hover:text-black
          hover:scale-105
        "
      >
        Contact
      </button>

      {showFeedback && email && (
        <a
          href={`mailto:${email}`}
          className="text-[11px] uppercase tracking-[0.35em] text-yellow-500 transition hover:text-yellow-400"
        >
          Feedback
        </a>
      )}
    </div>
  );
}