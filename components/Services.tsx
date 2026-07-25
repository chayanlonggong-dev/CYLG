"use client";

import { useLanguage } from "@/app/providers/LanguageProvider";

export default function Services() {
  const { messages } = useLanguage();

  const services = [
    messages.services.items.booking,
    messages.services.items.travel,
    messages.services.items.vip,
    messages.services.items.supreme,
  ];

  return (
    <section
      id="services"
      className="bg-[#0B0B0B] px-6 py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.6em] text-yellow-400">
            {messages.services.label}
          </p>

          <h2 className="mt-6 text-5xl font-black text-white">
            {messages.services.title}
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-9 text-gray-300">
            {messages.services.description}
          </p>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.title}
              className="
                group
                rounded-3xl
                border
                border-yellow-500/20
                bg-[#111111]
                p-10
                transition-all
                duration-500
                hover:-translate-y-2
                hover:scale-[1.02]
                hover:border-yellow-400
                hover:shadow-[0_0_40px_rgba(212,175,55,0.25)]
              "
            >
              <h3
                className="
                  text-2xl
                  font-bold
                  text-yellow-400
                  transition-colors
                  duration-300
                  group-hover:text-yellow-300
                "
              >
                {service.title}
              </h3>

              <p
                className="
                  mt-6
                  leading-8
                  text-gray-300
                "
              >
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}