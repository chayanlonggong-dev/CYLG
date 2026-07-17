"use client";

import { ChangeEvent, useState } from "react";

interface GalleryUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export default function GalleryUpload({
  value,
  onChange,
}: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);

    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/gallery", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        console.error("Gallery upload failed.");
        continue;
      }

      const data = await res.json();

      if (data.url) {
        uploadedUrls.push(data.url);
      }
    }

    onChange([...value, ...uploadedUrls]);

    setUploading(false);
  }

  function removeImage(index: number) {
    const next = value.filter((_, i) => i !== index);
    onChange(next);
  }

  return (
    <div className="space-y-4">

      <label className="block text-sm font-medium text-yellow-400">
        Gallery Images
      </label>

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleUpload(e.target.files)
        }
        className="block w-full rounded-lg border border-neutral-700 bg-neutral-900 p-3 text-white"
      />

      {uploading && (
        <p className="text-sm text-yellow-500">
          Uploading...
        </p>
      )}

      {value.length > 0 && (
        <div className="grid grid-cols-5 gap-4">

          {value.map((url, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-lg border border-yellow-500/20"
            >
              <img
                src={url}
                alt={`Gallery ${index + 1}`}
                className="h-32 w-full object-cover"
              />

              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-2 top-2 rounded bg-red-600 px-2 py-1 text-xs text-white"
              >
                ✕
              </button>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}