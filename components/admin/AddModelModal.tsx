"use client";

import AddModelForm from "./AddModelForm";

interface AddModelModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddModelModal({
  open,
  onClose,
}: AddModelModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative max-h-[95vh] w-full max-w-6xl overflow-y-auto rounded-3xl border border-yellow-500/20 bg-[#101010] p-8 shadow-2xl">

        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full border border-gray-600 px-4 py-2 text-white transition hover:border-red-500 hover:text-red-400"
        >
          ✕
        </button>

        <AddModelForm />

      </div>
    </div>
  );
}