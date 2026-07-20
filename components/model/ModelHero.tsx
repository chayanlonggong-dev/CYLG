"use client";

import { useState } from "react";

import ContactPopup from "@/components/ContactPopup";
import { useLanguage } from "@/app/providers/LanguageProvider";

interface ModelHeroProps {
  id: string;
  image: string;
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
}

function displayModelTitle(id: string) {
  if (id.startsWith("CROWN")) {
    const number = id.replace("CROWN", "");

    return {
      crown: true,
      title: `CY${number}`,
    };
  }

  return {
    crown: false,
    title: id,
  };
}

export default function ModelHero({
  id,
  image,
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
}: ModelHeroProps) {
  const { messages } = useLanguage();

  const [open, setOpen] = useState(false);

  const display = displayModelTitle(id);

  return (
    <section
      className="
        relative
        flex
        min-h-[700px]
        items-center
        justify-center
        overflow-hidden
        bg-black
      "
    >
      {image && (
        <img
          src={image}
          alt={id}
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
            opacity-40
          "
        />
      )}

      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 text-center">
        <p className="mb-8 uppercase tracking-[0.8em] text-yellow-500">
          {messages.hero.title}
        </p>

        <h1
          className="text-7xl font-black uppercase tracking-[0.25em] text-black md:text-9xl"
          style={{
            WebkitTextStroke: "4px #D4AF37",
            textShadow: "0 0 25px rgba(212,175,55,.8)",
          }}
        >
          {display.crown && "👑 "}
          {display.title}
        </h1>

        <div className="mx-auto mt-10 h-[2px] w-32 bg-yellow-500" />

        <p className="mt-10 max-w-3xl text-lg leading-9 text-gray-300">
          {messages.hero.description}
        </p>

        <button
          onClick={() => setOpen(true)}
          className="
            mt-14
            rounded-full
            border
            border-yellow-500
            px-12
            py-4
            tracking-[0.4em]
            text-yellow-500
            transition-all
            hover:bg-yellow-500
            hover:text-black
          "
        >
          {messages.contact.bookNow}
        </button>
      </div>

      <ContactPopup
        open={open}
        onClose={() => setOpen(false)}
        whatsapp={whatsapp}
        telegram={telegram}
        signal={signal}
        line={line}
        wechatQr={wechatQr}
        enableWhatsapp={enableWhatsapp}
        enableTelegram={enableTelegram}
        enableSignal={enableSignal}
        enableLine={enableLine}
        enableWechat={enableWechat}
        modelId={id}
      />
    </section>
  );
}