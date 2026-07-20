"use client";

import { useEffect, useState } from "react";
import LevelGrid from "./collection/LevelGrid";

interface Model {
  id: number;
  code: string;
  level: "CROWN" | "SSS" | "SS" | "S" | "A";
  avatar: string;
  gallery: string | null;
}

export default function CollectionCards() {
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
    <section className="bg-black py-24 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-yellow-500 uppercase tracking-[0.4em]">
            FEATURED COLLECTION
          </p>

          <h2 className="mt-4 text-5xl font-bold text-white">
            Elite Collection
          </h2>

          <p className="mt-6 text-gray-500">
            Select your exclusive companion.
          </p>
        </div>

        {loading && (
          <p className="text-center text-gray-400">
            Loading Collection...
          </p>
        )}

        {!loading && models.length === 0 && (
          <p className="text-center text-gray-500">
            No models available.
          </p>
        )}

        {!loading && models.length > 0 && (
          <LevelGrid models={models} />
        )}
      </div>
    </section>
  );
}