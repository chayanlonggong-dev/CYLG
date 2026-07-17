"use client";

import { useState } from "react";
import ContactPopup from "./ContactPopup";

interface BookingCardProps {
  whatsapp?: string;
  telegram?: string;
  signal?: string;
}

export default function BookingCard({
  whatsapp,
  telegram,
  signal,
}: BookingCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="bg-black py-24 px-6">
        <div className="max-w-5xl mx-auto rounded-3xl border border-yellow-500/20 bg-[#111111] p-12 text-center">

          <p className="uppercase tracking-[0.45em] text-yellow-400 text-sm">
            CONTACT
          </p>

          <h2 className="mt-5 text-5xl font-black text-white">
            Contact Us
          </h2>

          <p className="mt-6 max-w-2xl mx-auto text-gray-400 leading-8">
            Contact our concierge team to arrange your exclusive luxury experience.
          </p>

          <button
            onClick={() => setOpen(true)}
            className="mt-12 px-12 py-4 rounded-full bg-yellow-400 text-black font-bold uppercase tracking-[0.25em] hover:scale-105 duration-300"
          >
            Contact Us
          </button>

        </div>
      </section>

      <ContactPopup
        open={open}
        onClose={() => setOpen(false)}
        whatsapp={whatsapp}
        telegram={telegram}
        signal={signal}
      />
    </>
  );
}