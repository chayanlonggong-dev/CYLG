"use client";

import { useEffect, useState } from "react";

import AvatarUpload from "./AvatarUpload";
import GalleryUpload from "./GalleryUpload";
import VideoUpload from "./VideoUpload";
import IntroductionEditor from "./IntroductionEditor";

import { LEVELS } from "@/app/data/options";

interface EditModelFormProps {
  id: string;
  onSuccess?: () => void;
}

export default function EditModelForm({
  id,
  onSuccess,
}: EditModelFormProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [level, setLevel] = useState("CROWN");
  const [number, setNumber] = useState(1);

  const [age, setAge] = useState(18);
  const [height, setHeight] = useState(160);
  const [weight, setWeight] = useState(50);

  const [city, setCity] = useState("");
  const [nationality, setNationality] = useState("");
  const [languages, setLanguages] = useState("");

  const [online, setOnline] = useState(true);
  const [featured, setFeatured] = useState(false);

  const [avatar, setAvatar] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [introduction, setIntroduction] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/models/${id}`);

        if (!res.ok) {
          alert("Failed to load model.");
          return;
        }

        const model = await res.json();

        setLevel(model.level);
        setNumber(model.number);

        setAge(model.age);
        setHeight(model.height);
        setWeight(model.weight);

        setCity(model.city ?? "");
        setNationality(model.nationality ?? "");
        setLanguages(model.languages ?? "");

        setOnline(model.online);
        setFeatured(model.featured);

        setAvatar(model.avatar ?? "");

        setGallery(
          model.gallery
            ? model.gallery.split(",").filter(Boolean)
            : []
        );

        setVideos(
          model.videos
            ? model.videos.split(",").filter(Boolean)
            : []
        );

        setIntroduction(model.introduction ?? "");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  async function handleSave() {
    try {
      setSaving(true);

      const res = await fetch(`/api/models/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          level,
          number,

          age,
          height,
          weight,

          city,
          nationality,
          languages,

          online,
          featured,

          avatar,
          gallery: gallery.join(","),
          videos: videos.join(","),

          introduction,
        }),
      });

      if (!res.ok) {
        alert("Save failed.");
        return;
      }

      alert("Model updated.");

      onSuccess?.();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl rounded-3xl border border-yellow-500/20 bg-[#101010] p-10">
      <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
        CYLG CMS
      </p>

      <h2 className="mt-2 text-4xl font-black text-white">
        Edit Model
      </h2>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="rounded-xl bg-[#181818] p-4 text-white"
        >
          {LEVELS.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          placeholder="Age"
          className="rounded-xl bg-[#181818] p-4 text-white"
        />

        <input
          type="number"
          value={height}
          onChange={(e) => setHeight(Number(e.target.value))}
          placeholder="Height"
          className="rounded-xl bg-[#181818] p-4 text-white"
        />

        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          placeholder="Weight"
          className="rounded-xl bg-[#181818] p-4 text-white"
        />

        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          className="rounded-xl bg-[#181818] p-4 text-white"
        />

        <input
          value={nationality}
          onChange={(e) =>
            setNationality(e.target.value)
          }
          placeholder="Nationality"
          className="rounded-xl bg-[#181818] p-4 text-white"
        />

        <input
          value={languages}
          onChange={(e) =>
            setLanguages(e.target.value)
          }
          placeholder="Languages"
          className="rounded-xl bg-[#181818] p-4 text-white md:col-span-3"
        />
      </div>

      <div className="mt-8 flex gap-8">
        <label className="flex items-center gap-3 text-white">
          <input
            type="checkbox"
            checked={online}
            onChange={(e) =>
              setOnline(e.target.checked)
            }
          />
          Online
        </label>

        <label className="flex items-center gap-3 text-white">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) =>
              setFeatured(e.target.checked)
            }
          />
          Featured
        </label>
      </div>

      <div className="mt-10">
        <AvatarUpload
          value={avatar}
          onChange={setAvatar}
        />
      </div>

      <div className="mt-10">
        <GalleryUpload
          value={gallery}
          onChange={setGallery}
        />
      </div>

      <div className="mt-10">
        <VideoUpload
          value={videos}
          onChange={setVideos}
        />
      </div>

      <div className="mt-10">
        <IntroductionEditor
          value={introduction}
          onChange={setIntroduction}
        />
      </div>

      <div className="mt-12 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-yellow-500 px-10 py-4 font-bold text-black"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}