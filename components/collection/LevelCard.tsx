"use client";

import Link from "next/link";
import { useState } from "react";

import OfflineModal from "../OfflineModal";


interface Model {

  id:number;

  code:string;

  level:
    | "CROWN"
    | "SSS"
    | "SS"
    | "S"
    | "A";

  avatar:string;

  gallery:string | null;

  online:boolean;

}



interface LevelCardProps {

  model:Model;

}





export default function LevelCard({

  model,

}:LevelCardProps){


  const [offlineOpen,setOfflineOpen] =
    useState(false);



  function handleClick(
    e:React.MouseEvent
  ){

    if(!model.online){

      e.preventDefault();

      setOfflineOpen(true);

    }

  }



  const card = (

    <div

      className="
        cursor-pointer
        overflow-hidden
        rounded-2xl
        border
        border-yellow-500/30
        bg-[#111]
        transition
        hover:border-yellow-500
      "

    >


      <div

        className="
          aspect-4/5
          overflow-hidden
        "

      >

        <img

          src={
            model.avatar ||
            "/logo.png"
          }

          alt={
            model.code
          }

          className="
            h-full
            w-full
            object-cover
          "

        />

      </div>





      <div

        className="
          flex
          items-center
          justify-between
          px-5
          py-5
        "

      >


        <span

          className="
            text-xl
            font-bold
            text-yellow-500
          "

        >

          {model.code}

        </span>





        <span

          className={`

            rounded-full

            border

            px-3

            py-1

            text-xs


            ${
              model.online

              ?

              "border-green-500 text-green-400"

              :

              "border-gray-500 text-gray-400"

            }

          `}

        >

          {
            model.online
            ?
            "Online"
            :
            "Offline"
          }


        </span>


      </div>


    </div>

  );




  return (

    <>

      {
        model.online

        ?

        <Link

          href={
            `/models/${model.code}`
          }

        >

          {card}

        </Link>


        :


        <button

          type="button"

          onClick={
            handleClick
          }

          className="
            block
            w-full
            text-left
          "

        >

          {card}

        </button>

      }





      <OfflineModal

        open={
          offlineOpen
        }

        onClose={() =>
          setOfflineOpen(false)
        }

      />


    </>

  );

}