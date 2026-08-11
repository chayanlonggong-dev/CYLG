"use client";

import {
  useState,
} from "react";

import { useNotifications } from "./NotificationProvider";

import AvatarUpload from "./AvatarUpload";
import GalleryUpload from "./GalleryUpload";
import VideoUpload from "./VideoUpload";
import IntroductionEditor from "./IntroductionEditor";

import { LEVELS } from "@/app/data/options";

interface AddModelFormProps {
  onSuccess?: () => void;
}

export default function AddModelForm({
  onSuccess,
}: AddModelFormProps) {
  const [level, setLevel] =
    useState("CROWN");

  const [title, setTitle] =
    useState("");

  const [avatar, setAvatar] =
    useState("");

  const [gallery, setGallery] =
    useState<string[]>([]);

  const [videos, setVideos] =
    useState<string[]>([]);

  const [introduction, setIntroduction] =
    useState("");

  const [introductionZhTW, setIntroductionZhTW] =
    useState("");

  const [introductionZhCN, setIntroductionZhCN] =
    useState("");

  const [introductionJa, setIntroductionJa] =
    useState("");

  const [introductionKo, setIntroductionKo] =
    useState("");

  const {
    addNotification,
  } = useNotifications();

  const [loading, setLoading] =
    useState(false);

  async function handleSave() {
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      const response =
        await fetch(
          "/api/models",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              level,
              title,

              avatar,

              gallery:
                gallery.join(","),

              videos:
                videos.join(","),

              introductionEn:
                introduction,

              introductionZhTW,

              introductionZhCN,

              introductionJa,

              introductionKo,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Create model failed."
        );
      }

      addNotification({
        type: "success",
        title: "Model created",
        message: `Model ${
          result.code ||
          result.data?.code ||
          "record"
        } was created successfully.`,
      });

      resetForm();

      onSuccess?.();
    } catch (error) {
      console.error(error);

      addNotification({
        type: "error",
        title: "Create failed",
        message:
          error instanceof Error
            ? error.message
            : "Unable to create the model.",
      });
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setLevel("CROWN");
    setTitle("");
    setAvatar("");
    setGallery([]);
    setVideos([]);
    setIntroduction("");
    setIntroductionZhTW("");
    setIntroductionZhCN("");
    setIntroductionJa("");
    setIntroductionKo("");
  }

  return (
    <div>
      <label
        className="
          mb-3
          block
          text-sm
          uppercase
          tracking-[0.2em]
          text-yellow-500
        "
      >
        Level
      </label>

      <select
        value={level}
        onChange={(event) =>
          setLevel(event.target.value)
        }
        className="
          w-full
          rounded-2xl
          border
          border-yellow-500/20
          bg-[#181818]
          p-4
          text-white
        "
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

      <label
        className="
          mb-3
          mt-6
          block
          text-sm
          uppercase
          tracking-[0.2em]
          text-yellow-500
        "
      >
        Title
      </label>

      <input
        value={title}
        onChange={(event) =>
          setTitle(event.target.value)
        }
        placeholder="Model title"
        className="
          w-full
          rounded-2xl
          border
          border-yellow-500/20
          bg-[#181818]
          p-4
          text-white
        "
      />

      <div className="mt-6">
        <AvatarUpload
          value={avatar}
          onChange={setAvatar}
        />
      </div>

      <div className="mt-6">
        <GalleryUpload
          value={gallery}
          onChange={setGallery}
        />
      </div>

      <div className="mt-6">
        <VideoUpload
          value={videos}
          onChange={setVideos}
        />
      </div>

      <div className="mt-6">
        <IntroductionEditor
          value={introduction}
          onChange={setIntroduction}
          introductionZhTW={
            introductionZhTW
          }
          introductionZhCN={
            introductionZhCN
          }
          introductionJa={
            introductionJa
          }
          introductionKo={
            introductionKo
          }
          onTranslationChange={(
            language,
            value
          ) => {
            if (language === "zhTW") {
              setIntroductionZhTW(
                value
              );
            }

            if (language === "zhCN") {
              setIntroductionZhCN(
                value
              );
            }

            if (language === "ja") {
              setIntroductionJa(
                value
              );
            }

            if (language === "ko") {
              setIntroductionKo(
                value
              );
            }
          }}
        />
      </div>

      <div
        className="
          mt-12
          flex
          justify-end
          gap-4
        "
      >
        <button
          type="button"
          onClick={() => {
            resetForm();
            onSuccess?.();
          }}
          disabled={loading}
          className="
            rounded-full
            border
            border-gray-600
            px-8
            py-4
            text-white
          "
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="
            rounded-full
            border
            border-yellow-500
            bg-yellow-500
            px-10
            py-4
            font-bold
            uppercase
            tracking-[0.25em]
            text-black
          "
        >
          {loading
            ? "Saving..."
            : "Save Model"}
        </button>
      </div>
    </div>
  );
}
