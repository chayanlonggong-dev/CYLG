"use client";

import Link from "next/link";

export interface RecentModel {
  id: number;
  code: string;
  level: string;
  title: string;
  city: string;
  nationality: string;
  avatar: string;
  online: boolean;
  featured: boolean;
}

interface RecentModelsProps {
  models: RecentModel[];
  loading: boolean;
}

export default function RecentModels({
  models,
  loading,
}: RecentModelsProps) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-yellow-500/20 bg-[#111111] p-8">
        <h2 className="text-2xl font-black text-white">
          Recent Models
        </h2>

        <p className="mt-6 text-gray-400">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-[#111111] p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white">
          Recent Models
        </h2>

        <Link
          href="/admin/models"
          className="text-sm uppercase tracking-[0.25em] text-yellow-500 hover:text-yellow-400"
        >
          View All
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        {models.length === 0 ? (
          <p className="text-gray-400">
            No models found.
          </p>
        ) : (
          models.slice(0, 8).map((model) => (
            <div
              key={model.id}
              className="flex items-center justify-between rounded-2xl border border-yellow-500/10 bg-[#181818] p-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={model.avatar || "/placeholder.png"}
                  alt={model.code}
                  className="h-14 w-14 rounded-xl object-cover"
                />

                <div>
                  <p className="font-bold text-yellow-500">
                    {model.code}
                  </p>

                  <p className="text-sm text-gray-300">
                    {model.title || "Untitled"}
                  </p>

                  <p className="text-xs text-gray-500">
                    {model.city} • {model.nationality}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {model.online && (
                  <span className="rounded-full bg-green-600/20 px-3 py-1 text-xs text-green-400">
                    Online
                  </span>
                )}

                {model.featured && (
                  <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs text-yellow-400">
                    Featured
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}