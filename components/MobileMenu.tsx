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
          <a
            href="#hero"
            onClick={(event) => {
              event.preventDefault();
              onClose();
              scrollToSection("#hero");
            }}
          >
            Home
          </a>

          <a
            href="#collection"
            onClick={(event) => {
              event.preventDefault();
              onClose();
              scrollToSection("#collection");
            }}
          >
            Collection
          </a>

          <a
            href="#lifestyle"
            onClick={(event) => {
              event.preventDefault();
              onClose();
              scrollToSection("#lifestyle");
            }}
          >
            Lifestyle
          </a>

          <a
            href="#services"
            onClick={(event) => {
              event.preventDefault();
              onClose();
              scrollToSection("#services");
            }}
          >
            Services
          </a>

          <a
            href="#experience"
            onClick={(event) => {
              event.preventDefault();
              onClose();
              scrollToSection("#experience");
            }}
          >
            Experience
          </a>
        </nav>
      </aside>
    </>
  );
}