"use client";

import Image from "next/image";

import {
  useEffect,
} from "react";



interface WechatQrModalProps {

  open:boolean;

  onClose:()=>void;

  image?:string;

}





export default function WechatQrModal({

  open,

  onClose,

  image,

}:WechatQrModalProps){





  useEffect(()=>{


    if(!open){

      return;

    }



    document.body.style.overflow =
      "hidden";



    const handleKeyDown =
      (event:KeyboardEvent)=>{


        if(event.key==="Escape"){

          onClose();

        }


      };



    window.addEventListener(
      "keydown",
      handleKeyDown
    );





    return ()=>{


      document.body.style.overflow =
        "";


      window.removeEventListener(
        "keydown",
        handleKeyDown
      );


    };



  },[
    open,
    onClose,
  ]);






  if(!open){

    return null;

  }







  return (

    <div

      className="
        fixed
        inset-0
        z-[10000]
        flex
        items-center
        justify-center
        bg-black/90
        px-6
        backdrop-blur-sm
      "


      onClick={onClose}

    >




      <div

        className="
          relative
          w-full
          max-w-md
          rounded-3xl
          border
          border-yellow-500/30
          bg-[#101010]
          p-8
          shadow-2xl
        "


        onClick={(event)=>
          event.stopPropagation()
        }

      >






        <button

          type="button"

          onClick={onClose}

          className="
            absolute
            right-5
            top-5
            text-3xl
            text-gray-400
            transition
            hover:text-white
          "


          aria-label="Close WeChat QR"

        >

          ×

        </button>








        <p className="
          text-center
          uppercase
          tracking-[0.4em]
          text-yellow-500
        ">

          WeChat QR

        </p>








        <h2 className="
          mt-4
          text-center
          text-3xl
          font-bold
          text-white
        ">

          Scan to Connect

        </h2>








        <div className="
          mt-8
          flex
          justify-center
          rounded-2xl
          border
          border-yellow-500/20
          bg-black/60
          p-6
        ">



          {
            image ? (

              <div className="
                relative
                h-[320px]
                w-[280px]
                overflow-hidden
                rounded-xl
              ">


                <Image

                  src={image}

                  alt="WeChat QR code"

                  fill

                  sizes="280px"

                  className="
                    object-contain
                  "

                />


              </div>



            ) : (


              <div className="
                flex
                h-[280px]
                w-full
                max-w-[280px]
                items-center
                justify-center
                rounded-xl
                border
                border-dashed
                border-yellow-500/20
                text-center
                text-gray-400
              ">


                WeChat QR image is not available yet.



              </div>


            )
          }





        </div>






      </div>





    </div>

  );

}