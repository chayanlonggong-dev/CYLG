"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  defaultLocale,
  getMessages,
  type Locale,
} from "../../lib/i18n";

interface WebsiteLanguageSettings {
  enableChineseTraditional?: boolean;
  enableChineseSimplified?: boolean;
  enableJapanese?: boolean;
  enableKorean?: boolean;
}

interface SettingsResponse {
  success?: boolean;
  data?:
    | WebsiteLanguageSettings
    | {
        settings?: WebsiteLanguageSettings;
      };
  message?: string;
  error?: string;
}

interface LanguageContextType {
  locale: Locale;
  messages: ReturnType<typeof getMessages>;
  setLocale: (locale: Locale) => void;
  enabledLocales: Locale[];
}

const DEFAULT_ENABLED_LOCALES: Locale[] = [
  "en",
  "zh-TW",
  "zh-CN",
  "ja",
  "ko",
];

function extractSettings(
  json: SettingsResponse
): WebsiteLanguageSettings {
  const data = json.data;

  if (
    data &&
    typeof data === "object" &&
    "settings" in data
  ) {
    return data.settings ?? {};
  }

  if (
    data &&
    typeof data === "object"
  ) {
    return data as WebsiteLanguageSettings;
  }

  return {};
}

function getEnabledLocales(
  settings: WebsiteLanguageSettings
): Locale[] {
  const enabled: Locale[] = ["en"];

  if (settings.enableChineseTraditional !== false) {
    enabled.push("zh-TW");
  }

  if (settings.enableChineseSimplified !== false) {
    enabled.push("zh-CN");
  }

  if (settings.enableJapanese !== false) {
    enabled.push("ja");
  }

  if (settings.enableKorean !== false) {
    enabled.push("ko");
  }

  return enabled;
}

const LanguageContext =
  createContext<LanguageContextType | null>(null);

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [locale, setLocaleState] =
    useState<Locale>(defaultLocale);

  const [enabledLocales, setEnabledLocales] =
    useState<Locale[]>(
      DEFAULT_ENABLED_LOCALES
    );

  async function loadLanguageSettings() {
    try {
      const response = await fetch(
        "/api/settings",
        {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        }
      );

      if (!response.ok) {
        return;
      }

      const json =
        (await response.json()) as SettingsResponse;

      const settings =
        extractSettings(json);

      const enabled =
        getEnabledLocales(settings);

      setEnabledLocales(enabled);

      setLocaleState((currentLocale) => {
        if (
          enabled.includes(currentLocale)
        ) {
          return currentLocale;
        }

        return "en";
      });
    } catch (error) {
      console.error(
        "Failed to load language settings:",
        error
      );
    }
  }

  useEffect(() => {
    void loadLanguageSettings();

    function handleFocus() {
      void loadLanguageSettings();
    }

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, []);

  function setLocale(nextLocale: Locale) {
    if (
      !enabledLocales.includes(nextLocale)
    ) {
      setLocaleState("en");
      return;
    }

    setLocaleState(nextLocale);
  }

  const messages = useMemo(() => {
    return getMessages(locale);
  }, [locale]);

  return (
    <LanguageContext.Provider
      value={{
        locale,
        messages,
        setLocale,
        enabledLocales,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context =
    useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}
