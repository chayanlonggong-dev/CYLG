"use client";

import { useEffect, useState } from "react";

type Model = {
  id: number;
  level: string;
  number: number;
  code: string;
  avatar: string;
};

export default function ModelsList() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModels();
  }, []);

  async function loadModels() {
    try {
      const res = await fetch("/api/models");
      const data = await res.json();

      setModels(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const levels = ["CROWN", "SSS", "SS", "S", "A"];

  return (
    <div className="space-y-10">
      {levels.map((level) => {
        const list = models.filter((m) => m.level === level);

        return (
          <div
            key={level}
            className="rounded-3xl border border-yellow-500/20 bg-[#111111] p-8"
          >
            <h2 className="text-3xl font-bold text-yellow-500">
              {level} Collection
            </h2>

            {loading ? (
              <p className="mt-4 text-gray-400">
                Loading...
              </p>
            ) : list.length === 0 ? (
              <p className="mt-4 text-gray-400">
                No models yet.
              </p>
            ) : (
              <div className="mt-8 grid grid-cols-5 gap-6">
                {list.map((model) => (
                  <div
                    key={model.id}
                    className="rounded-2xl border border-yellow-500/20 bg-[#1a1a1a] p-6 text-center"
                  >
                    <div className="mb-4 flex h-40 items-center justify-center rounded-xl bg-[#222]">
                      {model.avatar ? (
                        <img
                          src={model.avatar}
                          className="h-full w-full rounded-xl object-cover"
                        />
                      ) : (
                        <span className="text-gray-500">
                          No Avatar
                        </span>
                      )}
                    </div>

                    <p className="font-bold text-yellow-500">
                      {model.code}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}