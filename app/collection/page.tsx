"use client";

import {
  useEffect,
  useState,
} from "react";

import CollectionCards from "@/components/CollectionCards";



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






export default function CollectionPage(){


  const [
    models,
    setModels,
  ] = useState<Model[]>([]);



  const [
    loading,
    setLoading,
  ] = useState(true);






  useEffect(()=>{


    async function fetchModels(){


      try{


        const res =
          await fetch(
            "/api/models"
          );



        const data =
          await res.json();



        setModels(

          Array.isArray(data)

          ?

          data

          :

          []

        );



      }catch(error){


        console.error(
          "Failed to load models:",
          error
        );


        setModels([]);


      }finally{


        setLoading(false);


      }


    }



    fetchModels();



  },[]);







  return (

    <main

      className="
        min-h-screen
        bg-black
      "

    >


      {
        loading

        ?

        (

          <div

            className="
              flex
              min-h-screen
              items-center
              justify-center
              text-gray-400
            "

          >

            Loading...

          </div>

        )

        :

        (

          <CollectionCards />

        )

      }


    </main>

  );


}