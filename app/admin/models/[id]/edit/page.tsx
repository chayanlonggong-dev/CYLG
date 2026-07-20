"use client";

import { useEffect, useState } from "react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

type Model = {
  code: string;
  level: string;
  number: number;
  avatar: string;
  gallery: string;
  videos: string;
  age: number;
  height: number;
  weight: number;
  city: string;
  nationality: string;
  languages: string;
  introduction: string;
  online: boolean;
  featured: boolean;
};

export default function EditModelPage({
  params,
}: PageProps) {
  const [loading, setLoading] = useState(true);

  const [model, setModel] = useState<Model | null>(null);

  useEffect(() => {
    async function loadModel() {
      const { id } = await params;

      try {
        const res = await fetch(`/api/models/${id}`);

        if (!res.ok) {
          setModel(null);
          return;
        }

        const data = await res.json();

        setModel(data);
      } finally {
        setLoading(false);
      }
    }

    loadModel();
  }, [params]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading...
      </main>
    );
  }

  if (!model) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        Model Not Found
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <p className="uppercase tracking-[0.35em] text-yellow-500">
        CYLG CMS
      </p>

      <h1 className="mt-3 text-5xl font-black">
        Edit {model.code}
      </h1>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Field label="Level" value={model.level} />
        <Field label="Number" value={model.number} />
        <Field label="Age" value={model.age} />
        <Field label="Height" value={`${model.height} cm`} />
        <Field label="Weight" value={`${model.weight} kg`} />
        <Field label="City" value={model.city} />
        <Field label="Nationality" value={model.nationality} />
        <Field
          label="Languages"
          value={model.languages}
        />
        <Field
          label="Online"
          value={model.online ? "Yes" : "No"}
        />
        <Field
          label="Featured"
          value={model.featured ? "Yes" : "No"}
        />
      </div>

      <div className="mt-10 rounded-3xl border border-yellow-500/20 bg-[#111111] p-8">
        <h2 className="mb-4 text-xl font-bold text-yellow-400">
          Introduction
        </h2>

        <div className="whitespace-pre-wrap text-gray-300">
          {model.introduction}
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
        {label}
      </p>

      <p className="mt-3 text-lg font-semibold text-white">
        {value}
      </p>
    </div>
  );
}