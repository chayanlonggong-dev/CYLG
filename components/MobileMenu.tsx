"use client";

function scrollToSection(hash: string) {
  if (typeof window === "undefined") {
    return;
  }

  const targetId = hash.replace("#", "");

  if (!targetId) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.history.replaceState(null, "", "/");
    return;
  }

  const element = document.getElementById(targetId);

  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  window.history.replaceState(null, "", hash);
}

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
          <button
            type="button"
            onClick={() => {
              onClose();
              scrollToSection("#hero");
            }}
            className="text-left"
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              scrollToSection("#collection");
            }}
            className="text-left"
          >
            Collection
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              scrollToSection("#lifestyle");
            }}
            className="text-left"
          >
            Lifestyle
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              scrollToSection("#services");
            }}
            className="text-left"
          >
            Services
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              scrollToSection("#experience");
            }}
            className="text-left"
          >
            Experience
          </button>
        </nav>
      </aside>
    </>
  );
}