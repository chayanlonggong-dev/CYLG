"use client";

import { useEffect, useState } from "react";
import CollectionCard from "./collection/CollectionCard";

interface Model {
  id: number;
  code: string;
  level: "CROWN" | "SSS" | "SS" | "S" | "A";
  avatar: string;
  gallery: string | null;
}

export default function CollectionCards() {
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


      } catch (error) {

        console.error(
          "Failed to load models:",
          error
        );

        setModels([]);


      } finally {

        setLoading(false);

      }

    }


    loadModels();


  }, []);



  // CYLG 等級排序
  const levelOrder = [
    "CROWN",
    "SSS",
    "SS",
    "S",
    "A",
  ];



  // 自動排序
  const sortedModels = [...models].sort(
    (a, b) => {


      const levelCompare =
        levelOrder.indexOf(a.level) -
        levelOrder.indexOf(b.level);



      if (levelCompare !== 0) {

        return levelCompare;

      }



      return a.code.localeCompare(
        b.code
      );

    }
  );



  return (

    <section className="bg-black py-24 px-8">

      <div className="max-w-7xl mx-auto">


        <div className="text-center mb-16">


          <p className="text-yellow-500 uppercase tracking-[0.4em]">
            FEATURED COLLECTION
          </p>


          <h2 className="text-5xl font-bold text-white mt-4">
            Elite Collection
          </h2>


          <p className="text-gray-500 mt-6">
            Select your exclusive companion.
          </p>


        </div>



        {loading && (

          <p className="text-center text-gray-400">
            Loading Collection...
          </p>

        )}



        {!loading && sortedModels.length === 0 && (

          <p className="text-center text-gray-500">
            No models available.
          </p>

        )}




        {!loading && sortedModels.length > 0 && (

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-3
              gap-10
            "
          >


            {sortedModels.map((model)=>(


              <CollectionCard

                key={model.id}

                id={model.code}


                images={[

                  ...(model.avatar
                    ? [model.avatar]
                    : []),


                  ...(model.gallery
                    ? model.gallery
                        .split(",")
                        .filter(Boolean)
                    : [])

                ]}


              />


            ))}


          </div>

        )}


      </div>

    </section>

  );

}