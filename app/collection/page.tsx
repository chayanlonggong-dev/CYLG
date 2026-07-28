"use client";

import { useEffect, useState } from "react";
import LevelGrid from "@/components/collection/LevelGrid";


interface Model {

  id: number;

  level:
    | "CROWN"
    | "SSS"
    | "SS"
    | "S"
    | "A";

}



export default function CollectionPage() {


  const [models, setModels] = useState<Model[]>([]);

  const [loading, setLoading] = useState(true);



  useEffect(() => {


    async function loadModels() {


      try {


        const res = await fetch("/api/models");


        const data = await res.json();


        setModels(
          Array.isArray(data)
            ? data
            : []
        );


      } catch(error) {


        console.error(
          "Load models failed",
          error
        );


        setModels([]);


      } finally {


        setLoading(false);


      }

    }


    loadModels();


  }, []);



  return (

    <main
      className="
        min-h-screen
        bg-black
        px-8
        py-24
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
            mb-20
          "
        >

          <p
            className="
              text-yellow-500
              tracking-[0.5em]
              uppercase
            "
          >
            Luxury Collection
          </p>


          <h1
            className="
              mt-5
              text-5xl
              font-bold
              text-white
            "
          >
            Exclusive Models
          </h1>


          <p
            className="
              mt-5
              text-gray-500
            "
          >
            Discover our private elite collection.
          </p>


        </div>



        {
          loading ? (

            <p
              className="
                text-center
                text-gray-400
              "
            >
              Loading...
            </p>


          ) : (


            <LevelGrid
              models={models}
            />


          )
        }



      </div>


    </main>

  );


}