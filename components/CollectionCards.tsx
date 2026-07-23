"use client";

import { useEffect, useState } from "react";
import LevelGrid from "./collection/LevelGrid";
import { useLanguage } from "@/app/providers/LanguageProvider";

interface Model {
  id: number;
  code: string;
  level: "CROWN" | "SSS" | "SS" | "S" | "A";
  avatar: string;
  gallery: string | null;
}

export default function CollectionCards() {
  const { messages } = useLanguage();

  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadModels() {
      try {
        const res = await fetch("/api/models");
        const data = await res.json();

        setModels(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load models:", error);
        setModels([]);
      } finally {
        setLoading(false);
      }
    }

    loadModels();
  }, []);

  return (
    <section
      id="collection"
      className="
        bg-black
        px-4
        py-16
        sm:px-6
        sm:py-20
        lg:px-8
        lg:py-24
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-6xl
        "
      >
        <div className="mb-12 text-center lg:mb-16">
          <p
            className="
              text-[11px]
              uppercase
              tracking-[0.3em]
              text-yellow-500
              sm:text-sm
              sm:tracking-[0.4em]
            "
          >
            {messages.nav.collection}
          </p>

          <h2
            className="
              mt-4
              text-3xl
              font-black
              tracking-[0.05em]
              text-white
              sm:text-4xl
              md:text-5xl
              lg:text-6xl
            "
          >
            {messages.nav.collection}
          </h2>

          <p
            className="
              mx-auto
              mt-5
              max-w-2xl
              px-2
              text-sm
              leading-7
              text-gray-400
              sm:text-base
              md:text-lg
              md:leading-8
            "
          >
            Select your exclusive companion.
          </p>
        </div>

        {loading && (
          <p
            className="
              text-center
              text-sm
              text-gray-400
              sm:text-base
            "
          >
            {messages.collection.loading}
          </p>
        )}

        {!loading && models.length === 0 && (
          <p
            className="
              text-center
              text-sm
              text-gray-500
              sm:text-base
            "
          >
            {messages.collection.noModels}
          </p>
        )}

        {!loading && models.length > 0 && (
          <LevelGrid models={models} />
        )}
      </div>
    </section>
  );
}