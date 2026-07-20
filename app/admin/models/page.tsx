"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Model = {
  id: number;
  code: string;
  level: string;
  avatar: string;
  online?: boolean;
};

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadModels() {
      try {
        const res = await fetch("/api/models");
        const data = await res.json();
        setModels(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setModels([]);
      } finally {
        setLoading(false);
      }
    }

    loadModels();
  }, []);

  return (
    <main className="p-10 text-white">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="uppercase tracking-[0.35em] text-yellow-500">
            CYLG CMS
          </p>

          <h1 className="mt-3 text-5xl font-black">
            Models Management
          </h1>
        </div>

        <Link
          href="/admin/models/new"
          className="rounded-full bg-yellow-500 px-8 py-3 font-bold text-black transition hover:bg-yellow-400"
        >
          + Add Model
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-yellow-500/20">
          <table className="w-full">
            <thead className="bg-[#111111]">
              <tr>
                <th className="p-5 text-left">Code</th>
                <th className="p-5 text-left">Level</th>
                <th className="p-5 text-left">Status</th>
                <th className="p-5 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {models.map((model) => (
                <tr
                  key={model.id}
                  className="border-t border-yellow-500/10"
                >
                  <td className="p-5">{model.code}</td>

                  <td className="p-5">{model.level}</td>

                  <td className="p-5">
                    {model.online ? "Online" : "Offline"}
                  </td>

                  <td className="p-5">
                    <Link
                      href={`/admin/models/${model.code}`}
                      className="text-yellow-400 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}

              {models.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-10 text-center text-gray-500"
                  >
                    No models found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}