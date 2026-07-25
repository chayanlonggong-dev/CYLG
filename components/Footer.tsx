"use client";

export default function Footer() {
  return (
    <footer className="border-t border-yellow-500/20 bg-[#050505]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <h2
              className="text-3xl font-bold text-white"
              style={{
                fontFamily: "var(--font-cinzel)",
              }}
            >
              ChaYanLongGong
            </h2>

            <p className="mt-4 leading-8 text-gray-400">
              Luxury Elite Companion Service
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-yellow-400">
              Navigation
            </h3>

            <div className="mt-6 flex flex-col gap-3 text-gray-300">
              <a href="#">Home</a>
              <a href="#collection">Collection</a>
              <a href="#lifestyle">Lifestyle</a>
              <a href="#services">Services</a>
              <a href="#experience">Experience</a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-yellow-400">
              Contact
            </h3>

            <p className="mt-6 leading-8 text-gray-300">
              Private luxury companion arrangements worldwide.
            </p>

            <p className="mt-4 text-gray-500">
              Contact us through the official channels provided on this website.
            </p>
          </div>
        </div>

        <div className="mt-16 border-t border-yellow-500/20 pt-8 text-center text-sm text-gray-500">
          © 2026 ChaYanLongGong. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}