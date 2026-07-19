"use client";

import { useEffect, useState } from "react";
import CollectionCard from "@/components/collection/CollectionCard";


interface Model {

  id: number;

  code: string;

  level:
    | "CROWN"
    | "SSS"
    | "SS"
    | "S"
    | "A";

  avatar: string;

  gallery: string | null;

}



interface PageProps {

  params: Promise<{
    level: string;
  }>;

}



const titleMap: Record<string, string> = {

  CROWN: "👑 Crown Collection",

  SSS: "SSS Collection",

  SS: "SS Collection",

  S: "S Collection",

  A: "A Collection",

};



export default function LevelPage({
  params,
}: PageProps) {


  const [level, setLevel] =
    useState("");



  const [models, setModels] =
    useState<Model[]>([]);



  const [loading, setLoading] =
    useState(true);



  useEffect(() => {


    async function loadData() {


      try {


        const paramsData =
          await params;



        const currentLevel =
          paramsData.level.toUpperCase();



        setLevel(currentLevel);



        const res =
          await fetch("/api/models");



        const data =
          await res.json();



        const filtered =
          Array.isArray(data)
            ? data.filter(
                (model: Model) =>
                  model.level === currentLevel
              )
            : [];



        setModels(filtered);



      } catch (error) {


        console.error(
          "Load collection failed:",
          error
        );


        setModels([]);



      } finally {


        setLoading(false);


      }


    }



    loadData();



  }, [params]);





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
            mb-16
          "
        >


          <h1
            className="
              text-5xl
              font-bold
              text-yellow-500
            "
          >

            {
              titleMap[level]
              ??
              "Collection"
            }

          </h1>



          <p
            className="
              mt-5
              text-gray-500
            "
          >

            {models.length} Profiles

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


          ) : models.length === 0 ? (


            <p
              className="
                text-center
                text-gray-500
              "
            >

              No models available.

            </p>


          ) : (


            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                xl:grid-cols-3
                gap-10
              "
            >


              {
                models.map((model)=>(


                  <CollectionCard

                    key={model.id}

                    id={model.code}

                    images={[
                      model.avatar,

                      ...(model.gallery
                        ? model.gallery
                            .split(",")
                            .filter(Boolean)
                        : [])

                    ]}

                  />


                ))
              }


            </div>


          )
        }



      </div>


    </main>

  );

}