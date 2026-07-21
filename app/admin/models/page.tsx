"use client";

import {
  useState,
  useCallback,
} from "react";

import ModelsList from "@/components/admin/ModelsList";
import AddModelModal from "@/components/admin/AddModelModal";



export default function ModelsPage() {


  const [modalOpen, setModalOpen] =
    useState(false);


  const [refreshKey, setRefreshKey] =
    useState(0);




  const refreshModels =
    useCallback(() => {

      setRefreshKey(
        (prev) => prev + 1
      );

    }, []);





  function openModal(){

    setModalOpen(true);

  }





  function closeModal(){

    setModalOpen(false);

  }





  function handleCreated(){

    refreshModels();

    closeModal();

  }





  return (

    <main
      className="
        min-h-screen
        bg-[#050505]
        p-10
        text-white
      "
    >



      <div
        className="
          mb-10
          flex
          items-center
          justify-between
        "
      >



        <div>


          <p
            className="
              uppercase
              tracking-[0.35em]
              text-yellow-500
            "
          >
            CYLG CMS
          </p>



          <h1
            className="
              mt-3
              text-5xl
              font-black
            "
          >
            Models Management
          </h1>


        </div>





        <button

          type="button"

          onClick={openModal}

          className="
            rounded-full
            bg-yellow-500
            px-8
            py-3
            font-bold
            text-black
            transition
            hover:bg-yellow-400
          "

        >

          + Add Model

        </button>



      </div>






      <ModelsList

        refreshKey={refreshKey}

      />







      <AddModelModal

        open={modalOpen}


        onClose={closeModal}


        onSuccess={handleCreated}


      />




    </main>

  );

}