"use client";

import { useEffect } from "react";
import { useLanguage } from "@/app/providers/LanguageProvider";

interface OfflineModalProps {
  open: boolean;
  onClose: () => void;
}

export default function OfflineModal({
  open,
  onClose,
}: OfflineModalProps) {
  const { messages } = useLanguage();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-[90%] max-w-md rounded-2xl border border-yellow-500/40 bg-[#111] p-8 text-center shadow-2xl"
      >
        <p className="text-sm leading-6 text-gray-300">
          {messages.collection.offlineTitle}
        </p>

        <p className="mt-3 text-sm leading-6 text-gray-400">
          {messages.collection.offlineMessage}
        </p>

        <button
          onClick={onClose}
          className="mt-6 rounded-full border border-yellow-500 px-8 py-2 text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
        >
          {messages.collection.close}
        </button>
      </div>
    </div>
  );
}
