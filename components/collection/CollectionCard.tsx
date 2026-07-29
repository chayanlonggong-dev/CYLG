"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ImageSlider from "./ImageSlider";
import ModelTitle from "./ModelTitle";
import OfflineModal from "@/components/OfflineModal";

interface CollectionCardProps {
  id: string;
  images: string[];
  online: boolean;
  onNavigate?: (modelId: string) => void;
}

export default function CollectionCard({
  id,
  images,
  online,
  onNavigate,
}: CollectionCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (online) {
      onNavigate?.(id);
      return;
    }

    event.preventDefault();
    setIsModalOpen(true);
  };

  const cardClassName =
    "group block overflow-hidden rounded-3xl bg-[#151515] border border-yellow-500/20 hover:border-yellow-400 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(255,215,0,.18)] transition-all duration-700";

  if (online) {
    return (
      <>
        <Link
          href={`/models/${id}`}
          onClick={() => onNavigate?.(id)}
          data-model-code={id}
          className={cardClassName}
        >
          <ImageSlider
            id={id}
            images={images.length > 0 ? images : ["/logo.png"]}
          />

          <ModelTitle id={id} status="online" />
        </Link>
      </>
    );
  }

  return (
    <>
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsModalOpen(true);
          }
        }}
        data-model-code={id}
        className={cardClassName}
      >
        <ImageSlider
          id={id}
          images={images.length > 0 ? images : ["/logo.png"]}
        />

        <ModelTitle id={id} status="offline" />
      </div>

      <OfflineModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
