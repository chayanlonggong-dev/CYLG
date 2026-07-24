"use client";

import {
  useState,
} from "react";

import Image from "next/image";

import ContactPopup from "@/components/ContactPopup";
import { useLanguage } from "@/app/providers/LanguageProvider";


interface ModelHeroProps {

  id:string;

  image:string;


  whatsapp?:string;
  telegram?:string;
  signal?:string;
  line?:string;
  wechatQr?:string;


  enableWhatsapp?:boolean;
  enableTelegram?:boolean;
  enableSignal?:boolean;
  enableLine?:boolean;
  enableWechat?:boolean;

}





function displayModelTitle(
  id:string
){

  if(id.startsWith("CROWN")){

    const number =
      id.replace(
        "CROWN",
        ""
      );


    return {

      crown:true,

      title:`CY${number}`,

    };

  }


  return {

    crown:false,

    title:id,

  };

}







export default function ModelHero({

  id,

  image,

  whatsapp,

  telegram,

  signal,

  line,

  wechatQr,


  enableWhatsapp,

  enableTelegram,

  enableSignal,

  enableLine,

  enableWechat,


}:ModelHeroProps){



  const { messages } =
    useLanguage();



  const [open,setOpen] =
    useState(false);





  const display =
    displayModelTitle(id);






  return (

    <section

      className="
        relative
        flex
        min-h-[700px]
        items-center
        justify-center
        overflow-hidden
        bg-black
      "

    >




      {
        image && (

          <Image

            src={image}

            alt={id}

            fill

            priority

            sizes="100vw"

            className="
              object-cover
              opacity-70
            "

          />

        )
      }






      <div

        className="
          absolute
          inset-0
          bg-black/40
        "

      />








      <div

        className="
          relative
          z-10
          text-center
          px-6
        "

      >






        <p

          className="
            mb-8
            uppercase
            tracking-[0.8em]
            text-yellow-500
          "

        >

          {messages.hero.title}

        </p>









        <div
          className="
            flex
            items-center
            justify-center
            gap-2
          "
        >

          {
            display.crown && (
              <span
                className="
                  text-[clamp(2.5rem,9vw,5rem)]
                  leading-none
                "
              >
                👑
              </span>
            )
          }

          <div
            className="
              relative
              inline-block
            "
          >
            <span
              className="
                absolute
                inset-0
                text-[clamp(3rem,12vw,7rem)]
                font-black
                uppercase
                tracking-[0.18em]
                text-transparent
                pointer-events-none
              "
              style={{
                fontFamily: "var(--font-cinzel)",
                WebkitTextStroke: "2px #B38A2B",
                paintOrder: "stroke fill",
                textShadow: "none",
              }}
            >
              {display.title}
            </span>

            <span
              className="
                relative
                text-[clamp(3rem,12vw,7rem)]
                font-black
                uppercase
                tracking-[0.18em]
              "
              style={{
                fontFamily: "var(--font-cinzel)",
                color: "#0a0a0a",
                WebkitTextStroke: "0.5px rgba(179, 138, 43, 0.5)",
                textShadow: "none",
              }}
            >
              {display.title}
            </span>
          </div>
        </div>









        <div

          className="
            mx-auto
            mt-10
            h-[2px]
            w-32
            bg-yellow-500
          "

        />









        <p

          className="
            mx-auto
            mt-10
            max-w-3xl
            text-base
            leading-8
            text-gray-300
            sm:text-lg
            sm:leading-9
          "

        >

          {messages.hero.description}

        </p>









        <button


          type="button"


          onClick={()=>
            setOpen(true)
          }


          className="
            mt-14
            rounded-full
            border
            border-yellow-500
            px-12
            py-4
            tracking-[0.4em]
            text-yellow-500
            transition-all
            hover:bg-yellow-500
            hover:text-black
          "

        >

          {messages.contact.bookNow}

        </button>






      </div>









      <ContactPopup

        open={open}

        onClose={()=>
          setOpen(false)
        }


        whatsapp={whatsapp}

        telegram={telegram}

        signal={signal}

        line={line}

        wechatQr={wechatQr}


        enableWhatsapp={enableWhatsapp}

        enableTelegram={enableTelegram}

        enableSignal={enableSignal}

        enableLine={enableLine}

        enableWechat={enableWechat}


        modelId={id}

      />







    </section>

  );


}