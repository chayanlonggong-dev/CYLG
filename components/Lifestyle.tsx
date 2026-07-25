"use client";

import { useLanguage } from "@/app/providers/LanguageProvider";

export default function Lifestyle() {
  const { messages } = useLanguage();

  const sections = [
    {
      video: "/video/champagne.mp4",
      ...messages.lifestyle.slides.luxuryLifestyle,
    },
    {
      video: "/video/lounge.mp4",
      ...messages.lifestyle.slides.privateLounge,
    },
    {
      video: "/video/penthouse.mp4",
      ...messages.lifestyle.slides.luxuryPenthouse,
    },
    {
      video: "/video/skyline-pool.mp4",
      ...messages.lifestyle.slides.skylinePool,
    },
    {
      video: "/video/woman-walk.mp4",
      ...messages.lifestyle.slides.elegantArrival,
    },
    {
      video: "/video/woman-window.mp4",
      ...messages.lifestyle.slides.privateMoments,
    },
    {
      video: "/video/whisky.mp4",
      ...messages.lifestyle.slides.luxuryNight,
    },
  ];

  return (
    <section id="lifestyle" className="bg-[#050505]">
      {sections.map((item) => (
        <section
          key={item.video}
          className="relative h-screen overflow-hidden"
        >
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src={item.video} type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-black/60" />

          <div className="relative z-10 flex h-full items-center justify-center px-6">
            <div className="max-w-4xl text-center">
              <p className="text-sm uppercase tracking-[0.6em] text-red-500">
  TEST 123
</p>

              <h2
                className="mt-6 text-4xl font-black text-white sm:text-6xl"
                style={{
                  fontFamily: "var(--font-cinzel)",
                }}
              >
                {item.title}
              </h2>

              <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-gray-300 sm:text-xl sm:leading-9">
                {item.description}
              </p>
            </div>
          </div>
        </section>
      ))}
    </section>
  );
}