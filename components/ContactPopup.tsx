"use client";

import { useMemo, useState } from "react";
import WechatQrModal from "./WechatQrModal";

interface ContactPopupProps {
  open: boolean;
  onClose: () => void;

  whatsapp?: string;
  telegram?: string;
  signal?: string;
  line?: string;
  wechatQr?: string;

  enableWhatsapp?: boolean;
  enableTelegram?: boolean;
  enableSignal?: boolean;
  enableLine?: boolean;
  enableWechat?: boolean;

  modelId?: string;
}

function buildContactMessage(modelId?: string) {
  if (modelId) {
    return [
      "Hi,",
      "",
      `I'm interested in ${modelId}.`,
      "",
      "Could you please provide more information?",
      "",
      "Thank you.",
    ].join("\n");
  }

  return [
    "Hi,",
    "",
    "I'm interested in your services.",
    "",
    "Could you please provide more information?",
    "",
    "Thank you.",
  ].join("\n");
}

function normalizeSignalTarget(value?: string) {
  if (!value) return "";

  const sanitized = value.replace(/[^\d+]/g, "");
  if (!sanitized) return "";

  return sanitized.startsWith("+") ? sanitized : `+${sanitized}`;
}

export default function ContactPopup({
  open,
  onClose,

  whatsapp,
  telegram,
  signal,
  line,
  wechatQr,

  enableWhatsapp,
  enableTelegram,
  enableSignal,
  enableLine,
  enableWechat,

  modelId,
}: ContactPopupProps) {
  const [isWechatQrOpen, setIsWechatQrOpen] = useState(false);

  const message = useMemo(() => buildContactMessage(modelId), [modelId]);

  if (!open) return null;

  const openContact = (platform: "whatsapp" | "telegram" | "signal" | "line" | "wechat") => {
    if (platform === "wechat") {
      if (!wechatQr) {
        return;
      }
      setIsWechatQrOpen(true);
      return;
    }

    const formattedMessage = encodeURIComponent(message);

    let url = "";

    switch (platform) {
      case "whatsapp": {
        const normalizedWhatsapp = whatsapp?.replace(/\D/g, "");
        url = normalizedWhatsapp ? `https://wa.me/${normalizedWhatsapp}?text=${formattedMessage}` : "";
        break;
      }
      case "telegram": {
        const telegramUsername = telegram
          ? telegram.replace(/^https?:\/\/t\.me\//i, "").replace(/^@/, "")
          : "";
        url = telegramUsername ? `https://t.me/${telegramUsername}?start=${formattedMessage}` : "";
        break;
      }
      case "signal": {
        const signalTarget = normalizeSignalTarget(signal);
        url = signalTarget ? `https://signal.me/#p/${signalTarget}` : "";
        break;
      }
      case "line": {
        url = line ? `https://line.me/R/msg/text/${formattedMessage}` : "";
        break;
      }
    }

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 px-6 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-md rounded-3xl border border-yellow-500/30 bg-[#101010] p-8 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-5 top-5 text-3xl text-gray-400 transition hover:text-white"
            aria-label="Close contact options"
          >
            ×
          </button>

          <p className="text-center uppercase tracking-[0.4em] text-yellow-500">
            CONTACT
          </p>

          <h2 className="mt-4 text-center text-3xl font-bold text-white">
            Contact Us
          </h2>

          <p className="mt-4 text-center text-gray-400">
            Choose your preferred contact platform.
          </p>

          <div className="mt-10 space-y-4">
            {enableWhatsapp && whatsapp && (
              <button
                type="button"
                onClick={() => openContact("whatsapp")}
                className="w-full rounded-full border border-[#25D366] px-6 py-4 text-center text-[#25D366] transition-all hover:bg-[#25D366] hover:text-white"
              >
                WhatsApp
              </button>
            )}

            {enableTelegram && telegram && (
              <button
                type="button"
                onClick={() => openContact("telegram")}
                className="w-full rounded-full border border-[#229ED9] px-6 py-4 text-center text-[#229ED9] transition-all hover:bg-[#229ED9] hover:text-white"
              >
                Telegram
              </button>
            )}

            {enableSignal && signal && (
              <button
                type="button"
                onClick={() => openContact("signal")}
                className="w-full rounded-full border border-[#3A76F0] px-6 py-4 text-center text-[#3A76F0] transition-all hover:bg-[#3A76F0] hover:text-white"
              >
                Signal
              </button>
            )}

            {enableLine && line && (
              <button
                type="button"
                onClick={() => openContact("line")}
                className="w-full rounded-full border border-[#06C755] px-6 py-4 text-center text-[#06C755] transition-all hover:bg-[#06C755] hover:text-white"
              >
                LINE
              </button>
            )}

            {enableWechat && wechatQr && (
              <button
                type="button"
                onClick={() => openContact("wechat")}
                className="w-full rounded-full border border-[#07C160] px-6 py-4 text-center text-[#07C160] transition-all hover:bg-[#07C160] hover:text-white"
              >
                WeChat
              </button>
            )}
          </div>
        </div>
      </div>

      <WechatQrModal
        open={isWechatQrOpen}
        onClose={() => setIsWechatQrOpen(false)}
        image={wechatQr}
      />
    </>
  );
}
