"use client";

import Image from "next/image";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-yellow-600/40">

      <div className="max-w-7xl mx-auto h-24 px-8 flex items-center justify-between">

        {/* Logo */}

        <div className="flex items-center gap-6">

          <Image
            src="/logo.png"
            alt="CYLG"
            width={220}
            height={90}
            priority
          />

          <div>

            <h1 className="text-5xl font-bold text-white leading-none">
              ChaYanLongGong
            </h1>

            <p className="mt-2 text-yellow-500 tracking-[6px] uppercase text-sm">
              Luxury Elite Companion Service
            </p>

          </div>

        </div>

        {/* Menu */}

        <nav className="hidden lg:flex items-center gap-10 text-yellow-400 font-medium">

          <a href="#">Home</a>

          <a href="#">Collection</a>

          <a href="#">VIP</a>

          <a href="#">Gallery</a>

          <a href="#">Contact</a>

        </nav>

        {/* Language */}

        <button className="border border-yellow-500 rounded-full px-5 py-2 text-yellow-400 hover:bg-yellow-500 hover:text-black duration-300">
          EN | 中文
        </button>

      </div>

    </header>
  );
}