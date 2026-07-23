"use client";

import {
  useLanguage,
} from "@/app/providers/LanguageProvider";

export default function Hero() {
  const { messages } = useLanguage();

  return (
    <section
      className="
        relative
        overflow-hidden
        min-h-[calc(100svh-4rem)]
        sm:min-h-[calc(100svh-5rem)]
      "
    >
      <video
        className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
        "
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/logo.png"
      >
        <source
          src="/video/hero.mp4"
          type="video/mp4"
        />
      </video>

      <div
        className="
          absolute
          inset-0
          bg-black/70
        "
      />

      <div
        className="
          relative
          z-10
          flex
          min-h-[inherit]
          items-center
          justify-center
          px-6
          py-20
          sm:px-8
          sm:py-24
          lg:px-12
          lg:py-28
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-4xl
            text-center
          "
        >
          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.28em]
              text-yellow-400

              sm:text-xs

              lg:text-sm
              lg:tracking-[0.35em]
            "
          >
            {messages.hero.title}
          </p>

          <h1
            className="
              mt-5
              text-3xl
              font-black
              leading-[1.05]
              text-white
              sm:text-5xl
              md:text-6xl
              lg:text-7xl
              xl:text-8xl
              break-words
            "
          >
            ChaYanLongGong
          </h1>

          <h2
            className="
              mx-auto
              mt-5

              max-w-3xl

              text-xl
              font-bold
              leading-tight
              text-yellow-400

              sm:text-3xl
              md:text-4xl
              lg:text-5xl
            "
          >
            {messages.hero.subtitle}
          </h2>

          <p
            className="
              mx-auto

              mt-6

              max-w-xl

              text-sm
              leading-7
              text-white

              sm:max-w-2xl
              sm:text-lg

              lg:max-w-4xl
              lg:text-xl
              lg:leading-9
            "
          >
            {messages.hero.description}
          </p>

          <div
            className="
              mt-8
              flex
              justify-center
              sm:mt-10
            "
          >
            <a
              href="#collection"
              className="
                inline-flex
                items-center
                justify-center
                rounded-full
                border
                border-yellow-500
                px-8
                py-3
                text-sm
                font-semibold
                text-yellow-400
                transition
                hover:bg-yellow-500
                hover:text-black
                sm:px-10
                sm:py-4
                sm:text-lg
              "
            >
              {messages.hero.button}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}