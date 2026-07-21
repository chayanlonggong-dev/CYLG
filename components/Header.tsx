"use client";

import Image from "next/image";

import {
  useLanguage,
} from "@/app/providers/LanguageProvider";



export default function Header(){


  const {
    locale,
    setLocale,
    messages,

  } = useLanguage();





  return (

    <header

      className="
        fixed
        left-0
        top-0
        z-50
        w-full
        border-b
        border-yellow-600/40
        bg-black/80
        backdrop-blur-xl
      "

    >



      <div className="
        mx-auto
        flex
        h-24
        max-w-7xl
        items-center
        justify-between
        px-8
      ">






        <div className="
          flex
          items-center
          gap-6
        ">





          <Image

            src="/logo.png"

            alt="ChaYanLongGong"

            width={220}

            height={90}

            priority

            sizes="220px"

          />







          <div>


            <h1 className="
              text-5xl
              font-bold
              leading-none
              text-white
            ">

              ChaYanLongGong

            </h1>





            <p className="
              mt-2
              text-sm
              uppercase
              tracking-[6px]
              text-yellow-500
            ">

              Luxury Elite Companion Service

            </p>



          </div>





        </div>








        <nav className="
          hidden
          items-center
          gap-10
          font-medium
          text-yellow-400
          lg:flex
        ">


          <a href="#">
            {messages.nav.home}
          </a>


          <a href="#">
            {messages.nav.collection}
          </a>


          <a href="#">
            VIP
          </a>


          <a href="#">
            {messages.nav.gallery}
          </a>


          <a href="#">
            {messages.nav.contact}
          </a>



        </nav>







        <select

          value={locale}

          onChange={(e)=>
            setLocale(
              e.target.value as any
            )
          }

          className="
            rounded-full
            border
            border-yellow-500
            bg-black
            px-4
            py-2
            text-yellow-400
            outline-none
          "

        >


          <option value="en">
            English
          </option>


          <option value="zh-TW">
            繁體中文
          </option>


          <option value="zh-CN">
            简体中文
          </option>


          <option value="ja">
            日本語
          </option>


          <option value="ko">
            한국어
          </option>



        </select>






      </div>



    </header>

  );

}