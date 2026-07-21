"use client";

import {
  useEffect,
} from "react";

import AddModelForm from "./AddModelForm";


interface AddModelModalProps {

  open: boolean;

  onClose: () => void;

  onSuccess?: () => void;

}



export default function AddModelModal({

  open,

  onClose,

  onSuccess,

}: AddModelModalProps) {



  useEffect(()=>{


    if(!open){

      document.body.style.overflow = "";

      return;

    }



    document.body.style.overflow = "hidden";



    return ()=>{

      document.body.style.overflow = "";

    };


  },[open]);





  if(!open){

    return null;

  }






  function handleSuccess(){


    onSuccess?.();


    onClose();


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
        bg-black/80
        px-4
        backdrop-blur-sm
      "


      onClick={onClose}

    >



      <div

        className="
          relative
          max-h-[95vh]
          w-full
          max-w-6xl
          overflow-y-auto
          rounded-3xl
          border
          border-yellow-500/20
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
            right-6
            top-6
            rounded-full
            border
            border-gray-600
            px-4
            py-2
            text-white
            transition
            hover:border-red-500
            hover:text-red-400
          "


        >

          ✕


        </button>





        <AddModelForm

          onSuccess={handleSuccess}

        />




      </div>


    </div>


  );


}