"use client";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({
  open,
  onClose,
}: MobileMenuProps) {
  if (!open) {
    return null;
  }

  return (
    <>
      <div
        className="
          fixed
          inset-0
          z-40
          bg-black/70
          backdrop-blur-sm
        "
        onClick={onClose}
      />

      <aside
        className="
          fixed
          right-0
          top-0
          z-50
          flex
          h-full
          w-72
          flex-col
          border-l
          border-yellow-500/20
          bg-[#0B0B0B]
          p-8
          shadow-2xl
        "
      >
        <button
          type="button"
          onClick={onClose}
          className="
            self-end
            text-3xl
            text-yellow-400
          "
        >
          ✕
        </button>

        <nav
          className="
            mt-10
            flex
            flex-col
            gap-6
            text-lg
            text-yellow-400
          "
        >
          <a href="#" onClick={onClose}>
            Home
          </a>

          <a href="#collection" onClick={onClose}>
            Collection
          </a>

          <a href="#" onClick={onClose}>
            VIP
          </a>

          <a href="#" onClick={onClose}>
            Gallery
          </a>

          <a href="#" onClick={onClose}>
            Contact
          </a>
        </nav>
      </aside>
    </>
  );
}