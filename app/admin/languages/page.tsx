"use client";

import {
  useEffect,
  useState,
} from "react";

interface WebsiteSettings {
  siteName?: string;
  logo?: string;
  favicon?: string;
  whatsapp?: string;
  telegram?: string;
  signal?: string;
  line?: string;
  wechatQr?: string;
  email?: string;

  enableWhatsApp?: boolean;
  enableTelegram?: boolean;
  enableSignal?: boolean;
  enableLine?: boolean;
  enableWechat?: boolean;
  enableFeedbackEmail?: boolean;

  enableChineseTraditional?: boolean;
  enableChineseSimplified?: boolean;
  enableJapanese?: boolean;
  enableKorean?: boolean;
}

interface SettingsResponse {
  success?: boolean;
  data?: WebsiteSettings | { settings?: WebsiteSettings };
  message?: string;
  error?: string;
}

const DEFAULT_SETTINGS: WebsiteSettings = {
  siteName: "",
  logo: "",
  favicon: "",
  whatsapp: "",
  telegram: "",
  signal: "",
  line: "",
  wechatQr: "",
  email: "",

  enableWhatsApp: true,
  enableTelegram: true,
  enableSignal: false,
  enableLine: false,
  enableWechat: false,
  enableFeedbackEmail: true,

  enableChineseTraditional: true,
  enableChineseSimplified: true,
  enableJapanese: true,
  enableKorean: true,
};

interface LanguageItem {
  key:
    | "enableChineseTraditional"
    | "enableChineseSimplified"
    | "enableJapanese"
    | "enableKorean";
  name: string;
  code: string;
  description: string;
}

const LANGUAGES: LanguageItem[] = [
  {
    key: "enableChineseTraditional",
    name: "\u7E41\u9AD4\u4E2D\u6587",
    code: "ZH-TW",
    description:
      "Traditional Chinese frontend language.",
  },
  {
    key: "enableChineseSimplified",
    name: "\u7B80\u4F53\u4E2D\u6587",
    code: "ZH-CN",
    description:
      "Simplified Chinese frontend language.",
  },
  {
    key: "enableJapanese",
    name: "\u65E5\u672C\u8A9E",
    code: "JA",
    description:
      "Japanese frontend language.",
  },
  {
    key: "enableKorean",
    name: "\uD55C\uAD6D\uC5B4",
    code: "KO",
    description:
      "Korean frontend language.",
  },
];

function extractSettings(
  json: SettingsResponse
): WebsiteSettings {
  const data = json.data;

  if (
    data &&
    typeof data === "object" &&
    "settings" in data &&
    data.settings
  ) {
    return data.settings;
  }

  return (data as WebsiteSettings) ?? {};
}

export default function LanguagesPage() {
  const [settings, setSettings] =
    useState<WebsiteSettings>(
      DEFAULT_SETTINGS
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        setError("");
        setMessage("");

        const response =
          await fetch("/api/settings", {
            method: "GET",
            cache: "no-store",
            credentials: "include",
          });

        const json =
          (await response.json()) as SettingsResponse;

        if (!response.ok) {
          throw new Error(
            json.message ||
              json.error ||
              "Failed to load language settings."
          );
        }

        const loadedSettings =
          extractSettings(json);

        setSettings({
          ...DEFAULT_SETTINGS,
          ...loadedSettings,
        });
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load language settings."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  function toggleLanguage(
    key: LanguageItem["key"]
  ) {
    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));

    setMessage("");
    setError("");
  }

  async function saveSettings() {
    if (saving) {
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response =
        await fetch("/api/settings", {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            ...DEFAULT_SETTINGS,
            ...settings,
          }),
        });

      const json =
        (await response.json()) as SettingsResponse;

      if (!response.ok) {
        throw new Error(
          json.message ||
            json.error ||
            "Failed to save language settings."
        );
      }

      /*
       * PUT /api/settings returns:
       *
       * {
       *   data: {
       *     settings: WebsiteSettings
       *   }
       * }
       *
       * Therefore we must extract data.settings
       * instead of treating data itself as WebsiteSettings.
       */
      const savedSettings =
        extractSettings(json);

      setSettings({
        ...DEFAULT_SETTINGS,
        ...savedSettings,
      });

      setMessage(
        "Language settings saved successfully."
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save language settings."
      );
    } finally {
      setSaving(false);
    }
  }

  const enabledCount =
    LANGUAGES.filter(
      (language) =>
        settings[language.key] === true
    ).length;

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white sm:px-10">
      <div className="mx-auto max-w-5xl">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-yellow-500">
            CYLG CMS
          </p>

          <h1 className="mt-4 text-4xl font-black sm:text-5xl">
            Language Management
          </h1>

          <p className="mt-4 max-w-2xl text-gray-400">
            Control which frontend languages are
            available to visitors.
          </p>
        </div>

        <div className="mt-10 rounded-3xl border border-yellow-500/20 bg-[#101010] p-6 sm:p-8">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                Frontend Languages
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Enabled languages:{" "}
                <span className="text-yellow-400">
                  {enabledCount}
                </span>
                {" / "}
                {LANGUAGES.length}
              </p>
            </div>

            <div className="rounded-full border border-yellow-500/20 bg-black px-4 py-2 text-xs font-semibold uppercase tracking-wider text-yellow-400">
              Visitor Language Control
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-500">
              Loading language settings...
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {LANGUAGES.map(
                (language) => {
                  const enabled =
                    settings[
                      language.key
                    ] === true;

                  return (
                    <div
                      key={language.key}
                      className="
                        flex
                        items-center
                        justify-between
                        gap-6
                        rounded-2xl
                        border
                        border-white/5
                        bg-black/40
                        px-5
                        py-5
                        transition
                        hover:border-yellow-500/20
                      "
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-bold text-yellow-400">
                            {language.name}
                          </h3>

                          <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-gray-500">
                            {language.code}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-gray-500">
                          {language.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={enabled}
                        aria-label={`Toggle ${language.name}`}
                        onClick={() =>
                          toggleLanguage(
                            language.key
                          )
                        }
                        className={`
                          relative
                          h-8
                          w-14
                          shrink-0
                          rounded-full
                          border
                          transition
                          duration-200
                          ${
                            enabled
                              ? "border-yellow-500 bg-yellow-500"
                              : "border-white/20 bg-black"
                          }
                        `}
                      >
                        <span
                          className={`
                            absolute
                            top-1
                            h-6
                            w-6
                            rounded-full
                            bg-white
                            shadow
                            transition
                            duration-200
                            ${
                              enabled
                                ? "left-7"
                                : "left-1"
                            }
                          `}
                        />
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-6 rounded-2xl border border-green-500/20 bg-green-500/5 px-5 py-4 text-sm text-green-400">
              {message}
            </div>
          )}

          <div className="mt-8 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={saveSettings}
              disabled={loading || saving}
              className="
                w-full
                rounded-2xl
                bg-yellow-500
                px-6
                py-4
                font-bold
                text-black
                transition
                hover:bg-yellow-400
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {saving
                ? "SAVING..."
                : "SAVE LANGUAGE SETTINGS"}
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/5 bg-[#0B0B0B] px-5 py-4 text-sm text-gray-500">
          <span className="text-yellow-500">
            Note:
          </span>{" "}
          Disabling a language only removes it
          from the frontend language selector.
          Existing model translations are not
          deleted.
        </div>
      </div>
    </main>
  );
}