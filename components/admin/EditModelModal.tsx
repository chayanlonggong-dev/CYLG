"use client";

import { useEffect, useState } from "react";

import AvatarUpload from "./AvatarUpload";
import GalleryUpload from "./GalleryUpload";
import IntroductionEditor from "./IntroductionEditor";
import VideoUpload from "./VideoUpload";

import { LEVELS } from "@/app/data/options";

export type AdminModel = {
  id: number;
  level: string;
  number: number;
  code: string;
  title: string;
  nationality: string;
  city: string;
  age: number;
  height: number;
  weight: number;
  languages: string;
  services: string;
  avatar: string;
  gallery: string;
  videos: string;
  introduction: string;
  online: boolean;
  featured: boolean;
};

interface EditModelModalProps {
  open: boolean;
  model: AdminModel | null;
  onClose: () => void;
  onSaved: () => void;
}

const emptyModel: AdminModel = {
  id: 0,
  level: "CROWN",
  number: 1,
  code: "",
  title: "",
  nationality: "",
  city: "",
  age: 18,
  height: 160,
  weight: 50,
  languages: "",
  services: "",
  avatar: "",
  gallery: "",
  videos: "",
  introduction: "",
  online: true,
  featured: false,
};

export default function EditModelModal({
  open,
  model,
  onClose,
  onSaved,
}: EditModelModalProps) {
  const [form, setForm] = useState<AdminModel>(emptyModel);
  const [gallery, setGallery] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!model) return;

    setForm({
      ...emptyModel,
      ...model,
    });
    setGallery(model.gallery ? model.gallery.split(",").filter(Boolean) : []);
    setVideos(model.videos ? model.videos.split(",").filter(Boolean) : []);
  }, [model, open]);

  if (!open || !model) return null;

  function updateField<K extends keyof AdminModel>(key: K, value: AdminModel[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    if (!model) {
      onClose();
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        gallery: gallery.join(","),
        videos: videos.join(","),
        age: Number(form.age),
        height: Number(form.height),
        weight: Number(form.weight),
        number: Number(form.number),
        online: Boolean(form.online),
        featured: Boolean(form.featured),
      };

      const response = await fetch(`/api/models/${model.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save model.");
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm">
      <div className="relative max-h-[95vh] w-full max-w-6xl overflow-y-auto rounded-3xl border border-yellow-500/20 bg-[#101010] p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full border border-gray-600 px-4 py-2 text-white transition hover:border-red-500 hover:text-red-400"
        >
          ✕
        </button>

        <div className="max-w-5xl">
          <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
            CYLG CMS
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">Edit Model</h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm uppercase tracking-[0.2em] text-yellow-500">
                Level
              </label>
              <select
                value={form.level}
                onChange={(event) => updateField("level", event.target.value)}
                className="w-full rounded-2xl border border-yellow-500/20 bg-[#181818] p-4 text-white"
              >
                {LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm uppercase tracking-[0.2em] text-yellow-500">
                Model Number
              </label>
              <input
                type="number"
                value={form.number}
                onChange={(event) => updateField("number", Number(event.target.value))}
                className="w-full rounded-2xl border border-yellow-500/20 bg-[#181818] p-4 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm uppercase tracking-[0.2em] text-yellow-500">
                Code
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(event) => updateField("code", event.target.value)}
                className="w-full rounded-2xl border border-yellow-500/20 bg-[#181818] p-4 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm uppercase tracking-[0.2em] text-yellow-500">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                className="w-full rounded-2xl border border-yellow-500/20 bg-[#181818] p-4 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm uppercase tracking-[0.2em] text-yellow-500">
                Nationality
              </label>
              <input
                type="text"
                value={form.nationality}
                onChange={(event) => updateField("nationality", event.target.value)}
                className="w-full rounded-2xl border border-yellow-500/20 bg-[#181818] p-4 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm uppercase tracking-[0.2em] text-yellow-500">
                City
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(event) => updateField("city", event.target.value)}
                className="w-full rounded-2xl border border-yellow-500/20 bg-[#181818] p-4 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm uppercase tracking-[0.2em] text-yellow-500">
                Age
              </label>
              <input
                type="number"
                value={form.age}
                onChange={(event) => updateField("age", Number(event.target.value))}
                className="w-full rounded-2xl border border-yellow-500/20 bg-[#181818] p-4 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm uppercase tracking-[0.2em] text-yellow-500">
                Height (cm)
              </label>
              <input
                type="number"
                value={form.height}
                onChange={(event) => updateField("height", Number(event.target.value))}
                className="w-full rounded-2xl border border-yellow-500/20 bg-[#181818] p-4 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm uppercase tracking-[0.2em] text-yellow-500">
                Weight (kg)
              </label>
              <input
                type="number"
                value={form.weight}
                onChange={(event) => updateField("weight", Number(event.target.value))}
                className="w-full rounded-2xl border border-yellow-500/20 bg-[#181818] p-4 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm uppercase tracking-[0.2em] text-yellow-500">
                Languages
              </label>
              <input
                type="text"
                value={form.languages}
                onChange={(event) => updateField("languages", event.target.value)}
                className="w-full rounded-2xl border border-yellow-500/20 bg-[#181818] p-4 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm uppercase tracking-[0.2em] text-yellow-500">
                Services
              </label>
              <input
                type="text"
                value={form.services}
                onChange={(event) => updateField("services", event.target.value)}
                className="w-full rounded-2xl border border-yellow-500/20 bg-[#181818] p-4 text-white"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <label className="flex items-center gap-3 rounded-2xl border border-yellow-500/20 bg-[#181818] px-4 py-3 text-sm text-white">
              <input
                type="checkbox"
                checked={form.online}
                onChange={(event) => updateField("online", event.target.checked)}
              />
              Online
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-yellow-500/20 bg-[#181818] px-4 py-3 text-sm text-white">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => updateField("featured", event.target.checked)}
              />
              Featured
            </label>
          </div>

          <div className="mt-8">
            <AvatarUpload value={form.avatar} onChange={(value) => updateField("avatar", value)} />
          </div>

          <div className="mt-8">
            <GalleryUpload value={gallery} onChange={setGallery} />
          </div>

          <div className="mt-8">
            <VideoUpload value={videos} onChange={setVideos} />
          </div>

          <div className="mt-8">
            <IntroductionEditor value={form.introduction} onChange={(value) => updateField("introduction", value)} />
          </div>

          <div className="mt-10 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-600 px-8 py-4 text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="rounded-full border border-yellow-500 bg-yellow-500 px-10 py-4 font-bold uppercase tracking-[0.25em] text-black"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}