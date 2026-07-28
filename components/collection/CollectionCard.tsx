"use client";

import ImageSlider from "./ImageSlider";
import ModelTitle from "./ModelTitle";
import OfflineModal from "../OfflineModal";

import { useState } from "react";


interface CollectionCardProps {

  id: string;

  images: string[];

  online?: boolean;

  onNavigate?: (
    modelId: string
  ) => void;

}



export default function CollectionCard({

  id,

  images,

  online = true,

  onNavigate,

}: CollectionCardProps) {


  const [
    showOffline,
    setShowOffline,
  ] = useState(false);



  function handleClick() {


    if (!online) {

      setShowOffline(true);

      return;

    }


    onNavigate?.(id);

  }





  return (

    <>

      <div

        onClick={handleClick}

        data-model-code={id}

        className="
          group
          block
          cursor-pointer
          overflow-hidden
          rounded-3xl
          bg-[#151515]
          border
          border-yellow-500/20
          hover:border-yellow-400
          hover:-translate-y-2
          hover:shadow-[0_0_40px_rgba(255,215,gold,.18)]
          transition-all
          duration-700
        "

      >


        <ImageSlider

          id={id}

          images={
            images.length > 0
            ?
            images
            :
            ["/logo.png"]
          }

        />



        <ModelTitle

          id={id}

        />


      </div>





      {
        showOffline && (

          <OfflineModal

            open={showOffline}

            onClose={() =>
              setShowOffline(false)
            }

          />

        )
      }


    </>

  );

}