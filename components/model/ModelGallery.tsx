"use client";

import Image from "next/image";
import { useState } from "react";

interface ModelGalleryProps {
  id: string;
  images: string[];
}

export default function ModelGallery({
  id,
  images,
}: ModelGalleryProps) {
  const [current, setCurrent] = useState(0);

  return (
    <section className="bg-[#050505] py-32 px-6">

      <div className="max-w-7xl mx-auto">

        {/* Title */}

        <div className="text-center mb-16">

          <p className="uppercase tracking-[0.6em] text-yellow-400 text-sm">
            Exclusive Collection
          </p>

          <h2 className="text-5xl md:text-6xl font-black text-white mt-6">
            GALLERY
          </h2>

          <div className="w-32 h-[2px] bg-yellow-400 mx-auto mt-8" />

        </div>

        {/* Main Image */}

        <div className="relative aspect-[4/5] w-full max-w-2xl mx-auto overflow-hidden rounded-3xl border border-yellow-500/30 shadow-[0_0_50px_rgba(250,204,21,0.08)]">

          <Image
            src={images[current]}
            alt={`${id}-${current + 1}`}
            fill
            priority
            sizes="(max-width:768px)100vw,900px"
            className="object-cover transition-transform duration-700 hover:scale-105"
          />

        </div>

        {/* Thumbnail */}

        <div className="flex justify-center gap-5 mt-10 flex-wrap">

          {images.map((image, index) => (

            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`relative h-32 w-24 overflow-hidden rounded-2xl transition-all duration-300 ${
                current === index
                  ? "border-2 border-yellow-400 scale-110 shadow-[0_0_25px_rgba(250,204,21,0.4)]"
                  : "border border-white/10 hover:border-yellow-400 hover:scale-105"
              }`}
            >

              <Image
                src={image}
                alt={`${id}-${index + 1}`}
                fill
                sizes="100px"
                className="object-cover"
              />

            </button>

          ))}

        </div>

      </div>

    </section>
  );
}