"use client";

import Image from "next/image";
import { useEffect, useState, useMemo } from "react";

interface ImageSliderProps {
  id: string;
  images: string[];
}

export default function ImageSlider({
  id,
  images,
}: ImageSliderProps) {
  const safeImages = useMemo(
    () =>
      images.length > 0
        ? images
        : ["/logo.png"],
    [images]
  );

  const [current, setCurrent] = useState(0);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!hover || safeImages.length <= 1) {
      setCurrent(0);
      return;
    }

    const timer = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % safeImages.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [hover, safeImages.length]);

  return (
    <div
      className="
        relative
        h-130
        overflow-hidden
      "
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Image
        src={safeImages[current]}
        alt={id}
        fill
        quality={85}
        unoptimized
        priority={false}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        sizes="
          (max-width:768px) 100vw,
          (max-width:1200px) 50vw,
          33vw
        "
        className="
          object-cover
          transition-transform
          duration-700
          group-hover:scale-105
        "
      />
    </div>
  );
}