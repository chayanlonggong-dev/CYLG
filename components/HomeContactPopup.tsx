"use client";

interface HomeContactPopupProps {
  isOpen: boolean;
  onClose: () => void;

  whatsapp?: string;
  telegram?: string;
  signal?: string;
  line?: string;
  wechat?: string;
  email?: string;

  enableWhatsapp?: boolean;
  enableTelegram?: boolean;
  enableSignal?: boolean;
  enableLine?: boolean;
  enableWechat?: boolean;
  enableFeedbackEmail?: boolean;
}

export default function HomeContactPopup({
  isOpen,
  onClose,

  whatsapp,
  telegram,
  signal,
  line,
  wechat,
  email,

  enableWhatsapp,
  enableTelegram,
  enableSignal,
  enableLine,
  enableWechat,
  enableFeedbackEmail,
}: HomeContactPopupProps) {
  if (!isOpen) return null;

  return (
    <div
      className="
      fixed
      inset-0
      z-[9999]
      flex
      items-center
      justify-center
      bg-black/80
      backdrop-blur-sm
      px-6
      "
    >
      <div
        className="
        relative
        w-full
        max-w-md
        rounded-3xl
        border
        border-yellow-500/30
        bg-[#101010]
        p-8
        shadow-2xl
        "
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="
          absolute
          right-5
          top-5
          text-3xl
          text-gray-400
          hover:text-white
          "
        >
          ×
        </button>

        <p
          className="
          text-center
          uppercase
          tracking-[0.5em]
          text-yellow-500
          "
        >
          CONTACT
        </p>

        <h2
          className="
          mt-5
          text-center
          text-3xl
          font-bold
          text-white
          "
        >
          ChaYanLongGong
        </h2>

        <p
          className="
          mt-4
          text-center
          text-gray-400
          "
        >
          Choose your preferred contact method.
        </p>

        <div
          className="
          mt-10
          space-y-4
          "
        >
          {enableWhatsapp && whatsapp && (
            <a
              href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="
              block
              rounded-full
              border
              border-green-500
              px-6
              py-4
              text-center
              text-green-400
              hover:bg-green-500
              hover:text-black
              transition
              "
            >
              WhatsApp
            </a>
          )}

          {enableTelegram && telegram && (
            <a
              href={`https://t.me/${telegram.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="
              block
              rounded-full
              border
              border-blue-500
              px-6
              py-4
              text-center
              text-blue-400
              hover:bg-blue-500
              hover:text-black
              transition
              "
            >
              Telegram
            </a>
          )}

          {enableSignal && signal && (
            <a
              href={`https://signal.me/#p/${signal.replace("+", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="
              block
              rounded-full
              border
              border-gray-400
              px-6
              py-4
              text-center
              text-gray-300
              hover:bg-gray-300
              hover:text-black
              transition
              "
            >
              Signal
            </a>
          )}

          {enableLine && line && (
            <a
              href={`https://line.me/ti/p/${line}`}
              target="_blank"
              rel="noopener noreferrer"
              className="
              block
              rounded-full
              border
              border-green-400
              px-6
              py-4
              text-center
              text-green-300
              hover:bg-green-400
              hover:text-black
              transition
              "
            >
              LINE
            </a>
          )}

          {enableWechat && wechat && (
            <div
              className="
              rounded-full
              border
              border-yellow-500
              px-6
              py-4
              text-center
              text-yellow-400
              "
            >
              WeChat : {wechat}
            </div>
          )}
        </div>

        {enableFeedbackEmail && email && (
          <div
            className="
            mt-10
            border-t
            border-yellow-500/20
            pt-8
            text-center
            "
          >
            <p
              className="
              uppercase
              tracking-[0.3em]
              text-yellow-500
              "
            >
              Feedback & Complaints
            </p>

            <a
              href={`mailto:${email}`}
              className="
              mt-4
              inline-block
              text-gray-300
              hover:text-yellow-400
              transition
              "
            >
              {email}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}