"use client";

import { useState } from "react";

import AvatarUpload from "./AvatarUpload";
import GalleryUpload from "./GalleryUpload";
import VideoUpload from "./VideoUpload";
import IntroductionEditor from "./IntroductionEditor";

import { LEVELS } from "@/app/data/options";

export default function AddModelForm() {
  const [level, setLevel] = useState("CROWN");
  const [number, setNumber] = useState("001");

  const [avatar, setAvatar] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [introduction, setIntroduction] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSave() {
    try {
      setLoading(true);

      const response = await fetch("/api/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          level,
          number,
          avatar,
          gallery: gallery.join(","),
          videos: videos.join(","),
          introduction,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.log(result);
        alert(JSON.stringify(result, null, 2));
        return;
      }

      alert("Model saved successfully.");

      setLevel("CROWN");
      setNumber("001");
      setAvatar("");
      setGallery([]);
      setVideos([]);
      setIntroduction("");
    } catch (error) {
      console.error(error);
      alert(String(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-6xl rounded-3xl border border-yellow-500/20 bg-[#101010] p-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="uppercase tracking-[0.35em] text-sm text-yellow-500">
            CYLG CMS
          </p>

          <h2 className="mt-2 text-4xl font-black text-white">
            Add New Model
          </h2>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-8">
        <div>
          <label className="mb-3 block text-sm uppercase tracking-[0.2em] text-yellow-500">
            Level
          </label>

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full rounded-2xl border border-yellow-500/20 bg-[#181818] p-4 text-white"
          >
            {LEVELS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-3 block text-sm uppercase tracking-[0.2em] text-yellow-500">
            Number
          </label>

          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full rounded-2xl border border-yellow-500/20 bg-[#181818] p-4 text-white"
          />
        </div>
      </div>

      <div className="mt-12">
        <AvatarUpload value={avatar} onChange={setAvatar} />
      </div>

      <div className="mt-12">
        <GalleryUpload value={gallery} onChange={setGallery} />
      </div>

      <div className="mt-12">
        <VideoUpload value={videos} onChange={setVideos} />
      </div>

      <div className="mt-12">
        <IntroductionEditor
          value={introduction}
          onChange={setIntroduction}
        />
      </div>

      <div className="mt-12 flex justify-end gap-4">
        <button
          type="button"
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
          {loading ? "Saving..." : "Save Model"}
        </button>
      </div>
    </div>
  );
}