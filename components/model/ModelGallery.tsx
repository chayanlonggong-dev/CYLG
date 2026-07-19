"use client";


import Image from "next/image";
import { useEffect, useState } from "react";



interface ModelGalleryProps {

  id: string;

  images: string[];

}



export default function ModelGallery({

  id,

  images,

}: ModelGalleryProps) {


  const [current,setCurrent] = useState(0);

  const [open,setOpen] = useState(false);



  useEffect(()=>{


    const close = (e:KeyboardEvent)=>{

      if(e.key==="Escape"){

        setOpen(false);

      }

    };


    window.addEventListener(
      "keydown",
      close
    );


    return ()=>{

      window.removeEventListener(
        "keydown",
        close
      );

    };


  },[]);




  if(!images || images.length===0){

    return null;

  }




  function next(){

    setCurrent(
      (current + 1) % images.length
    );

  }



  function previous(){

    setCurrent(
      current === 0
      ?
      images.length - 1
      :
      current - 1
    );

  }




  return (

    <section
      className="
        bg-[#050505]
        py-32
        px-6
      "
    >


      <div
        className="
          max-w-7xl
          mx-auto
        "
      >



        <div
          className="
            text-center
            mb-16
          "
        >

          <p
            className="
              text-yellow-400
              tracking-[0.6em]
              uppercase
              text-sm
            "
          >
            Exclusive Collection
          </p>


          <h2
            className="
              text-white
              text-5xl
              md:text-6xl
              font-black
              mt-6
            "
          >
            GALLERY
          </h2>


          <div
            className="
              w-32
              h-[2px]
              bg-yellow-400
              mx-auto
              mt-8
            "
          />


        </div>





        {/* Main Image */}


        <div

          onClick={()=>setOpen(true)}

          className="
            relative
            aspect-[4/5]
            max-w-2xl
            mx-auto
            overflow-hidden
            rounded-3xl
            border
            border-yellow-500/30
            cursor-pointer
          "

        >


          <Image

            src={images[current]}

            alt={`${id}-${current}`}

            fill

            priority

            className="
              object-cover
              hover:scale-105
              transition
              duration-700
            "

          />


        </div>





        {/* Thumbnail */}


        <div

          className="
            flex
            justify-center
            gap-5
            mt-10
            flex-wrap
          "

        >

          {
            images.map((image,index)=>(

              <button

                key={index}

                onClick={()=>setCurrent(index)}

                className={`
                  relative
                  h-28
                  w-20
                  overflow-hidden
                  rounded-xl
                  border

                  ${
                    current===index
                    ?
                    "border-yellow-400 scale-110"
                    :
                    "border-white/20"
                  }

                `}

              >


                <Image

                  src={image}

                  alt={`${id}-${index}`}

                  fill

                  className="
                    object-cover
                  "

                />


              </button>


            ))
          }


        </div>




      </div>





      {/* Lightbox */}



      {
        open &&

        <div

          className="
            fixed
            inset-0
            z-50
            bg-black/95
            flex
            items-center
            justify-center
          "

        >


          <button

            onClick={()=>setOpen(false)}

            className="
              absolute
              top-8
              right-10
              text-white
              text-4xl
            "

          >
            ×

          </button>




          <button

            onClick={previous}

            className="
              absolute
              left-8
              text-yellow-400
              text-5xl
            "

          >
            ‹

          </button>




          <div

            className="
              relative
              w-[85vw]
              h-[85vh]
            "

          >


            <Image

              src={images[current]}

              alt="gallery"

              fill

              className="
                object-contain
              "

            />


          </div>





          <button

            onClick={next}

            className="
              absolute
              right-8
              text-yellow-400
              text-5xl
            "

          >

            ›

          </button>



        </div>

      }



    </section>

  );

}