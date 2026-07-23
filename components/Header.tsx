"use client";

import Image from "next/image";
import { useState } from "react";

import { useLanguage } from "@/app/providers/LanguageProvider";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const {
    locale,
    setLocale,
    messages,
  } = useLanguage();

  const [menuOpen, setMenuOpen] = useState(false);

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
          paddingTop: "env(safe-area-inset-top, 0px)",
        }}
      >
        <div
          className="
            mx-auto
            flex
            min-h-[4rem]
            max-w-7xl
            items-center
            justify-between
            px-4
            sm:min-h-[5rem]
            sm:px-6
            lg:min-h-[6rem]
            lg:px-8
          "
        >
          {/* Mobile */}
          <div className="flex items-center lg:hidden">
            <Image
              src="/logo.png"
              alt="ChaYanLongGong"
              width={140}
              height={56}
              priority
              className="h-auto w-[120px]"
            />
          </div>

          {/* Desktop */}
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
            <a href="#">
              {messages.nav.home}
            </a>

            <a href="#collection">
              {messages.nav.collection}
            </a>

            <a href="#">
              VIP
            </a>

            <a href="#">
              {messages.nav.gallery}
            </a>

            <a href="#">
              {messages.nav.contact}
            </a>
          </nav>

          {/* Mobile Right */}
          <div className="flex items-center gap-3">
            <select
              value={locale}
              onChange={(e) =>
                setLocale(e.target.value as typeof locale)
              }
              className="
                rounded-full
                border
                border-yellow-500
                bg-black
                px-2
                py-1.5
                text-xs
                text-yellow-400
                outline-none
                sm:text-sm
                lg:px-4
                lg:py-2
              "
            >
              <option value="en">EN</option>
              <option value="zh-TW">繁</option>
              <option value="zh-CN">简</option>
              <option value="ja">JP</option>
              <option value="ko">KR</option>
            </select>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
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
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
}