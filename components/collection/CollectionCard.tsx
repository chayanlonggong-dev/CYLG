"use client";

import Link from "next/link";
import ImageSlider from "./ImageSlider";
import ModelTitle from "./ModelTitle";


interface CollectionCardProps {

  id: string;

  images: string[];

  onNavigate?: (modelId: string) => void;

}



export default function CollectionCard({

  id,

  images,

  onNavigate,

}: CollectionCardProps) {


  return (

    <Link

      href={`/models/${id}`}

      onClick={() =>
        onNavigate?.(id)
      }

      data-model-code={id}

      className="
        group
        block
        overflow-hidden
        rounded-3xl
        bg-[#151515]
        border
        border-yellow-500/20
        hover:border-yellow-400
        hover:-translate-y-2
        hover:shadow-[0_0_40px_rgba(255,215,0,.18)]
        transition-all
        duration-700
      "

    >


      {/* Image */}

      <ImageSlider

        id={id}

        images={
          images.length > 0
            ? images
            : ["/logo.png"]
        }

      />



      {/* Model ID */}

      <ModelTitle

        id={id}

      />


    </Link>

  );

}
