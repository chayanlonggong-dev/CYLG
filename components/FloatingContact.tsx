"use client";

interface FloatingContactProps {
  onOpen: () => void;
}

export default function FloatingContact({
  onOpen,
}: FloatingContactProps) {
  return (
    <button
      onClick={onOpen}
      className="
        fixed
        bottom-8
        right-8
        z-50

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
  );
}