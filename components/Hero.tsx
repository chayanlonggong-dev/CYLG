"use client";

import {
  useLanguage,
} from "@/app/providers/LanguageProvider";



export default function Hero(){

  const { messages } =
    useLanguage();




  return (

    <section

      className="
        relative
        h-screen
        overflow-hidden
      "

    >





      <video

        className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
        "


        autoPlay

        muted

        loop

        playsInline


        preload="metadata"


        poster="/logo.png"


      >


        <source

          src="/video/hero.mp4"

          type="video/mp4"

        />


      </video>







      <div className="
        absolute
        inset-0
        bg-black/60
      " />








      <div className="
        relative
        z-10
        flex
        h-full
        items-center
        justify-center
      ">


        <div className="
          max-w-4xl
          px-6
          text-center
        ">






          <p className="
            uppercase
            tracking-[0.4em]
            text-yellow-400
          ">

            {messages.hero.title}

          </p>







          <h1 className="
            mt-6
            text-7xl
            font-black
            text-white
            md:text-8xl
          ">

            ChaYanLongGong

          </h1>








          <h2 className="
            mt-6
            text-5xl
            font-bold
            text-yellow-400
          ">

            {messages.hero.subtitle}

          </h2>







          <p className="
            mt-8
            text-xl
            leading-9
            text-white
          ">

            {messages.hero.description}

          </p>







          <div className="
            mt-12
          ">


            <a

              href="#collection"

              className="
                rounded-full
                border
                border-yellow-500
                px-10
                py-4
                text-lg
                font-semibold
                text-yellow-400
                transition
                hover:bg-yellow-500
                hover:text-black
              "

            >

              {messages.hero.button}

            </a>



          </div>





        </div>



      </div>





    </section>

  );

}