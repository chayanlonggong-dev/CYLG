"use client";

import { ChangeEvent, useState } from "react";

interface AvatarUploadProps {
  value?: string;
  onChange: (url: string) => void;
}

export default function AvatarUpload({
  value,
  onChange,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload/avatar", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    setUploading(false);

    if (data.url) {
      onChange(data.url);
    }
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    upload(file);
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm text-yellow-400">
        Avatar
      </label>

      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="
          block
          w-full
          rounded
          border
          border-neutral-700
          bg-neutral-900
          p-3
        "
      />

      {uploading && (
        <div className="text-yellow-500">
          Uploading...
        </div>
      )}

      {value && (
        <img
          src={value}
          alt="Avatar"
          className="
            h-52
            rounded-lg
            border
            border-yellow-500/30
            object-cover
          "
        />
      )}
    </div>
  );
}