"use client";

import { ChangeEvent, useState } from "react";

interface VideoUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export default function VideoUpload({
  value,
  onChange,
}: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);

    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/video", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        console.error("Video upload failed.");
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

  function removeVideo(index: number) {
    const next = value.filter((_, i) => i !== index);
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-yellow-400">
        Videos
      </label>

      <input
        type="file"
        multiple
        accept="video/*"
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
        <div className="space-y-2">
          {value.map((url, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-yellow-500/20 bg-neutral-900 p-3"
            >
              <span className="truncate text-sm text-white">
                {url}
              </span>

              <button
                type="button"
                onClick={() => removeVideo(index)}
                className="rounded bg-red-600 px-2 py-1 text-xs text-white"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}