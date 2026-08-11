"use client";

import Image from "next/image";
import { useState } from "react";

import {
  useLanguage,
} from "@/app/providers/LanguageProvider";

import MobileMenu from "./MobileMenu";

function scrollToSection(hash: string) {
  if (typeof window === "undefined") {
    return;
  }

  const targetId = hash.replace("#", "");

  if (!targetId) {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    window.history.replaceState(
      null,
      "",
      "/"
    );

    return;
  }

  const element =
    document.getElementById(targetId);

  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  } else {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  window.history.replaceState(
    null,
    "",
    hash
  );
}

const LANGUAGE_OPTIONS = [
  {
    value: "en",
    label: "EN",
  },
  {
    value: "zh-TW",
    label: "繁",
  },
  {
    value: "zh-CN",
    label: "简",
  },
  {
    value: "ja",
    label: "JP",
  },
  {
    value: "ko",
    label: "KR",
  },
] as const;

export default function Header() {
  const {
    locale,
    setLocale,
    messages,
    enabledLocales,
  } = useLanguage();

  const [menuOpen, setMenuOpen] =
    useState(false);

  return (
    <>
      <header
        className="
          fixed
          left-0
          top-0
          z-40
          w-full
          border-b
          border-yellow-600/40
          bg-black/80
          backdrop-blur-xl
        "
        style={{
          paddingTop:
            "env(safe-area-inset-top, 0px)",
        }}
      >
        <div
          className="
            mx-auto
            flex
            min-h-[110px]
            max-w-[1400px]
            items-center
            justify-between
            gap-6
            px-6
            lg:px-8
          "
        >
          {/* Desktop Branding */}
          <div
            className="
              hidden
              items-center
              gap-6
              lg:flex
            "
          >
            <Image
              src="/logo.png"
              alt="ChaYanLongGong"
              width={220}
              height={90}
              priority
            />

            <div>
              <h1 className="text-5xl font-bold leading-none text-white">
                ChaYanLongGong
              </h1>

              <p
                className="
                  mt-2
                  text-sm
                  uppercase
                  tracking-[6px]
                  text-yellow-500
                "
              >
                Luxury Elite Companion Service
              </p>
            </div>
          </div>

          {/* Mobile Branding */}
          <div className="lg:hidden">
            <Image
              src="/logo.png"
              alt="ChaYanLongGong"
              width={130}
              height={55}
              priority
            />
          </div>

          {/* Desktop Navigation */}
          <nav
            className="
              hidden
              items-center
              gap-8
              font-medium
              text-yellow-400
              lg:flex
            "
          >
            <a
              href="#hero"
              className="transition hover:text-yellow-300"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("#hero");
              }}
            >
              {messages.nav.home}
            </a>

            <a
              href="#collection"
              className="transition hover:text-yellow-300"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("#collection");
              }}
            >
              {messages.nav.collection}
            </a>

            <a
              href="#lifestyle"
              className="transition hover:text-yellow-300"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("#lifestyle");
              }}
            >
              {messages.nav.lifestyle}
            </a>

            <a
              href="#services"
              className="transition hover:text-yellow-300"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("#services");
              }}
            >
              {messages.nav.services}
            </a>

            <a
              href="#experience"
              className="transition hover:text-yellow-300"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("#experience");
              }}
            >
              {messages.nav.experience}
            </a>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <select
              value={locale}
              onChange={(event) => {
                setLocale(
                  event.target.value as typeof locale
                );
              }}
              className="
                rounded-full
                border
                border-yellow-500
                bg-black
                px-3
                py-2
                text-sm
                text-yellow-400
                outline-none
                lg:px-4
              "
              aria-label="Select language"
            >
              {LANGUAGE_OPTIONS.filter(
                (language) =>
                  enabledLocales.includes(
                    language.value
                  )
              ).map((language) => (
                <option
                  key={language.value}
                  value={language.value}
                >
                  {language.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() =>
                setMenuOpen(true)
              }
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-yellow-500
                text-xl
                text-yellow-400
                lg:hidden
              "
              aria-label="Open Menu"
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() =>
          setMenuOpen(false)
        }
      />
    </>
  );
}
