"use client";

import { useLanguage } from "@/app/providers/LanguageProvider";


interface OfflineModalProps {

  open: boolean;

  onClose: () => void;

}



export default function OfflineModal({

  open,

  onClose,

}: OfflineModalProps) {


  const { messages } = useLanguage();



  if(!open){

    return null;

  }



  return (

    <div

      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/70
        backdrop-blur-sm
      "

      onClick={onClose}

    >


      <div

        onClick={(e)=>
          e.stopPropagation()
        }

        className="
          w-[90%]
          max-w-md
          rounded-2xl
          border
          border-yellow-500/40
          bg-[#111]
          p-8
          text-center
          shadow-2xl
        "

      >


        <h2

          className="
            text-xl
            font-semibold
            text-white
          "

        >

          {
            messages.collection.offlineTitle
          }

        </h2>



        <p

          className="
            mt-4
            text-sm
            leading-6
            text-gray-400
          "

        >

          {
            messages.collection.offlineMessage
          }

        </p>



        <button

          onClick={onClose}

          className="
            mt-6
            rounded-full
            border
            border-yellow-500
            px-8
            py-2
            text-yellow-400
            transition
            hover:bg-yellow-500
            hover:text-black
          "

        >

          OK

        </button>


      </div>


    </div>

  );

}