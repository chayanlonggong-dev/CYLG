"use client";

import { useState } from "react";

interface IntroductionEditorProps {
  value?: string;
  onChange?: (value: string) => void;

  introductionZhTW?: string;
  introductionZhCN?: string;
  introductionJa?: string;
  introductionKo?: string;

  onTranslationChange?: (
    language: "zhTW" | "zhCN" | "ja" | "ko",
    value: string
  ) => void;
}

type TranslationLanguage =
  | "zhTW"
  | "zhCN"
  | "ja"
  | "ko";

const LANGUAGE_LABELS: Record<
  TranslationLanguage,
  string
> = {
  zhTW: "Traditional Chinese",
  zhCN: "Simplified Chinese",
  ja: "Japanese",
  ko: "Korean",
};

export default function IntroductionEditor({
  value = "",
  onChange,
  introductionZhTW = "",
  introductionZhCN = "",
  introductionJa = "",
  introductionKo = "",
  onTranslationChange,
}: IntroductionEditorProps) {
  const [translating, setTranslating] =
    useState(false);

  const [translationError, setTranslationError] =
    useState("");

  function handleChange(
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    onChange?.(event.target.value);
  }

  async function handleTranslate() {
    const source = value.trim();

    if (!source) {
      setTranslationError(
        "Please enter the English introduction first."
      );
      return;
    }

    try {
      setTranslating(true);
      setTranslationError("");

      const response = await fetch(
        "/api/admin/translation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            source,
            languages: [
              "zhTW",
              "zhCN",
              "ja",
              "ko",
            ],
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Translation request failed."
        );
      }

      const translations =
        result.data?.translations ??
        result.translations ??
        {};

      const errors =
        result.data?.errors ??
        result.errors ??
        {};

      const successfulLanguages =
        (
          [
            "zhTW",
            "zhCN",
            "ja",
            "ko",
          ] as TranslationLanguage[]
        ).filter(
          (language) =>
            typeof translations[language] ===
              "string" &&
            translations[language].trim()
        );

      for (const language of successfulLanguages) {
        onTranslationChange?.(
          language,
          translations[language]
        );
      }

      const failedLanguages =
        (
          [
            "zhTW",
            "zhCN",
            "ja",
            "ko",
          ] as TranslationLanguage[]
        ).filter(
          (language) =>
            errors[language]
        );

      if (
        successfulLanguages.length === 0
      ) {
        throw new Error(
          "All translations failed."
        );
      }

      if (
        failedLanguages.length > 0
      ) {
        setTranslationError(
          `Translation completed with errors: ${failedLanguages.join(
            ", "
          )}`
        );
      }
    } catch (error) {
      console.error(
        "AI TRANSLATION ERROR:",
        error
      );

      setTranslationError(
        error instanceof Error
          ? error.message
          : "Translation failed."
      );
    } finally {
      setTranslating(false);
    }
  }

  const translations = {
    zhTW: introductionZhTW,
    zhCN: introductionZhCN,
    ja: introductionJa,
    ko: introductionKo,
  };

  return (
    <div>
      <div
        className="
          mb-4
          flex
          items-center
          justify-between
          gap-4
        "
      >
        <label
          className="
            block
            text-sm
            uppercase
            tracking-[0.25em]
            text-yellow-500
          "
        >
          Introduction
        </label>

        <button
          type="button"
          onClick={handleTranslate}
          disabled={
            translating ||
            !value.trim()
          }
          className="
            rounded-full
            border
            border-yellow-500
            px-5
            py-2
            text-xs
            font-bold
            uppercase
            tracking-[0.2em]
            text-yellow-500
            transition
            hover:bg-yellow-500
            hover:text-black
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          {translating
            ? "Translating..."
            : "AI Translate"}
        </button>
      </div>

      <textarea
        rows={18}
        value={value}
        onChange={handleChange}
        maxLength={5000}
        placeholder={`Paste the complete profile...

Example

Age : 22

Height : 168 cm

Nationality : Japanese

Languages
English
Japanese

Introduction...

Services...

Notes...

`}
        className="
          w-full
          resize-none
          rounded-3xl
          border
          border-yellow-500/20
          bg-[#181818]
          p-6
          text-white
          outline-none
          transition
          focus:border-yellow-500
          focus:ring-2
          focus:ring-yellow-500/20
        "
      />

      <div
        className="
          mt-4
          flex
          items-center
          justify-between
          text-sm
        "
      >
        <p className="text-gray-500">
          Supports multi-line text.
          Formatting will be preserved.
        </p>

        <span className="text-yellow-500">
          {value.length} / 5000 Characters
        </span>
      </div>

      {translationError && (
        <div
          className="
            mt-4
            rounded-2xl
            border
            border-yellow-500/20
            bg-yellow-500/5
            px-4
            py-3
            text-sm
            text-yellow-400
          "
        >
          {translationError}
        </div>
      )}

      <div className="mt-8 space-y-6">
        {(
          [
            "zhTW",
            "zhCN",
            "ja",
            "ko",
          ] as TranslationLanguage[]
        ).map((language) => (
          <div key={language}>
            <label
              className="
                mb-3
                block
                text-xs
                uppercase
                tracking-[0.2em]
                text-yellow-500
              "
            >
              {LANGUAGE_LABELS[language]}
            </label>

            <textarea
              rows={10}
              value={translations[language]}
              onChange={(event) =>
                onTranslationChange?.(
                  language,
                  event.target.value
                )
              }
              maxLength={5000}
              placeholder={`AI translation — ${LANGUAGE_LABELS[language]}`}
              className="
                w-full
                resize-none
                rounded-3xl
                border
                border-yellow-500/10
                bg-[#121212]
                p-5
                text-white
                outline-none
                transition
                focus:border-yellow-500
                focus:ring-2
                focus:ring-yellow-500/20
              "
            />
          </div>
        ))}
      </div>
    </div>
  );
}
