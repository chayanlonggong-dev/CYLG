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
    <section className="bg-black px-8 py-24">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-16 text-center">
          <p className="uppercase tracking-[0.4em] text-yellow-500">
            {messages.nav.collection}
          </p>

          <h2
  className="
    mt-4
    text-5xl
    font-black
    tracking-[0.08em]
    text-white
    md:text-6xl
  "
>
            {messages.nav.collection}
          </h2>

          <p
  className="
    mx-auto
    mt-6
    max-w-2xl
    text-lg
    leading-8
    text-gray-400
  "
>
            Select your exclusive companion.
          </p>
        </div>

        {loading && (
          <p className="text-center text-gray-400">
            {messages.collection.loading}
          </p>
        )}

        {!loading && models.length === 0 && (
          <p className="text-center text-gray-500">
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