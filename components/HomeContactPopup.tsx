"use client";

interface HomeContactPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HomeContactPopup({
  isOpen,
  onClose,
}: HomeContactPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
      <div className="relative w-full max-w-md rounded-3xl border border-yellow-500/20 bg-[#101010] p-8 shadow-2xl">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-2xl text-gray-400 transition hover:text-white"
        >
          ×
        </button>

        {/* Title */}
        <p className="text-center uppercase tracking-[0.4em] text-yellow-500">
          CONTACT
        </p>

        <h2 className="mt-4 text-center text-3xl font-bold text-white">
          ChaYanLongGong
        </h2>

        <p className="mt-4 text-center leading-7 text-gray-400">
          Choose your preferred contact method.
        </p>

        {/* Contact Buttons */}
        <div className="mt-10 space-y-4">
          <a
            href="#"
            className="block rounded-full border border-yellow-500 px-6 py-4 text-center font-medium text-white transition duration-300 hover:bg-yellow-500 hover:text-black"
          >
            WhatsApp
          </a>

          <a
            href="#"
            className="block rounded-full border border-yellow-500 px-6 py-4 text-center font-medium text-white transition duration-300 hover:bg-yellow-500 hover:text-black"
          >
            Telegram
          </a>

          <a
            href="#"
            className="block rounded-full border border-yellow-500 px-6 py-4 text-center font-medium text-white transition duration-300 hover:bg-yellow-500 hover:text-black"
          >
            Signal
          </a>
        </div>

        {/* Divider */}
        <div className="my-10 border-t border-yellow-500/20" />

        {/* Feedback */}
        <div className="text-center">
          <p className="uppercase tracking-[0.3em] text-yellow-500">
            Feedback &amp; Complaints
          </p>

          <a
            href="mailto:chayanlonggong@gmail.com?subject=Feedback%20%26%20Complaints"
            className="mt-4 inline-block text-gray-300 transition hover:text-yellow-400"
          >
            chayanlonggong@gmail.com
          </a>
        </div>

      </div>
    </div>
  );
}