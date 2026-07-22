"use client";

import Image from "next/image";

import {
  useEffect,
  useState,
} from "react";


interface ImageSliderProps {

  id: string;

  images: string[];

}



export default function ImageSlider({

  id,

  images,

}: ImageSliderProps) {


  const safeImages =
    images.length > 0
      ? images
      : ["/logo.png"];




  const [current, setCurrent] =
    useState(0);



  const [hover, setHover] =
    useState(false);





  useEffect(() => {


    if (!hover) {


      setCurrent(0);

      return;


    }





    const timer =
      setInterval(() => {


        setCurrent(
          prev =>
            (prev + 1)
            %
            safeImages.length
        );


      }, 3000);





    return () => {

      clearInterval(timer);

    };


  }, [
    hover,
    safeImages.length,
  ]);







  return (

    <div

      className="
        relative
        h-[520px]
        overflow-hidden
      "

      onMouseEnter={() =>
        setHover(true)
      }

      onMouseLeave={() =>
        setHover(false)
      }

    >



      <Image

        src={
          safeImages[current]
        }

        alt={id}

        quality={85}

        fill

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