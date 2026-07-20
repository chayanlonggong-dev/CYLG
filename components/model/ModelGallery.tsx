"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface ModelGalleryProps {
  id: string;
  images: string[];
}

export default function ModelGallery({
  id,
  images,
}: ModelGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const previous = useCallback(() => {
    setCurrent((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  }, [images.length]);

  useEffect(() => {
    if (!open) return;

    const preload = new window.Image();
    preload.src = images[(current + 1) % images.length];

    const preloadPrev = new window.Image();
    preloadPrev.src =
      images[
        current === 0 ? images.length - 1 : current - 1
      ];
  }, [current, open, images]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          setOpen(false);
          break;
        case "ArrowRight":
          next();
          break;
        case "ArrowLeft":
          previous();
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, next, previous]);

  if (!images.length) {
    return null;
  }

  return (
    <section className="bg-[#050505] px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="text-sm uppercase tracking-[0.6em] text-yellow-400">
            Exclusive Collection
          </p>

          <h2 className="mt-6 text-5xl font-black text-white md:text-6xl">
            GALLERY
          </h2>

          <div className="mx-auto mt-8 h-[2px] w-32 bg-yellow-400" />
        </div>

        <div
          onClick={() => setOpen(true)}
          className="relative mx-auto aspect-[4/5] max-w-2xl cursor-pointer overflow-hidden rounded-3xl border border-yellow-500/30"
        >
          <Image
            src={images[current]}
            alt={`${id}-${current}`}
            fill
            priority
            className="object-cover transition duration-700 hover:scale-105"
          />
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-5">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`relative h-28 w-20 overflow-hidden rounded-xl border transition ${
                current === index
                  ? "scale-110 border-yellow-400"
                  : "border-white/20"
              }`}
            >
              <Image
                src={image}
                alt={`${id}-${index}`}
                fill
                loading="lazy"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={() => setOpen(false)}
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute right-8 top-8 text-5xl text-white"
          >
            ×
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              previous();
            }}
            className="absolute left-5 text-6xl text-yellow-400 md:left-10"
          >
            ‹
          </button>

          <div
            className="relative h-[85vh] w-[90vw]"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => {
              touchStartX.current =
                e.changedTouches[0].clientX;
            }}
            onTouchEnd={(e) => {
              touchEndX.current =
                e.changedTouches[0].clientX;

              const distance =
                touchStartX.current - touchEndX.current;

              if (distance > 50) {
                next();
              } else if (distance < -50) {
                previous();
              }
            }}
          >
            <Image
              src={images[current]}
              alt={`${id}-${current}`}
              fill
              priority
              className="object-contain"
            />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-5 text-6xl text-yellow-400 md:right-10"
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}