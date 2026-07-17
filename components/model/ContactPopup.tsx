"use client";

interface ContactPopupProps {
  open: boolean;
  onClose: () => void;
  whatsapp?: string;
  telegram?: string;
  signal?: string;
}

export default function ContactPopup({
  open,
  onClose,
  whatsapp,
  telegram,
  signal,
}: ContactPopupProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
      <div className="relative w-full max-w-md rounded-3xl border border-yellow-500/20 bg-[#101010] p-8 shadow-2xl">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-2xl text-gray-400 hover:text-white transition"
        >
          ×
        </button>

        {/* Title */}
        <p className="text-center uppercase tracking-[0.4em] text-yellow-500">
          CONTACT
        </p>

        <h2 className="mt-4 text-center text-3xl font-bold text-white">
          Contact Us
        </h2>

        <p className="mt-4 text-center text-gray-400 leading-7">
          Choose your preferred contact platform.
        </p>

        {/* Contact Buttons */}
        <div className="mt-10 space-y-4">

          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-full border border-yellow-500 px-6 py-4 text-center font-medium text-white transition duration-300 hover:bg-yellow-500 hover:text-black"
            >
              WhatsApp
            </a>
          )}

          {telegram && (
            <a
              href={telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-full border border-yellow-500 px-6 py-4 text-center font-medium text-white transition duration-300 hover:bg-yellow-500 hover:text-black"
            >
              Telegram
            </a>
          )}

          {signal && (
            <a
              href={signal}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-full border border-yellow-500 px-6 py-4 text-center font-medium text-white transition duration-300 hover:bg-yellow-500 hover:text-black"
            >
              Signal
            </a>
          )}

        </div>

      </div>
    </div>
  );
}