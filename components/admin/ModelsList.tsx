"use client";

import { useEffect, useMemo, useState } from "react";

import EditModelModal, { type AdminModel } from "./EditModelModal";

const levelOrder = {
  CROWN: 0,
  SSS: 1,
  SS: 2,
  S: 3,
  A: 4,
} as const;

const levels = ["CROWN", "SSS", "SS", "S", "A"] as const;

type Model = AdminModel;

export default function ModelsList() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");

  const [selectedModel, setSelectedModel] =
    useState<Model | null>(null);

  const [modalOpen, setModalOpen] =
    useState(false);


  async function loadModels(
    query = search,
    filter = levelFilter
  ) {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      if (query.trim()) {
        params.set("search", query.trim());
      }

      if (filter !== "ALL") {
        params.set("level", filter);
      }

      const res = await fetch(
        `/api/models${
          params.toString()
            ? `?${params.toString()}`
            : ""
        }`
      );

      const data = await res.json();

      setModels(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {
      console.error(error);
      setModels([]);

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {

    const timer = window.setTimeout(() => {
      loadModels(
        search,
        levelFilter
      );
    },250);


    return () =>
      window.clearTimeout(timer);

  },[
    search,
    levelFilter
  ]);



  const groupedModels = useMemo(() => {

    const sorted = [...models].sort(
      (a,b)=>{

        const levelCompare =
          levelOrder[
            a.level as keyof typeof levelOrder
          ]
          -
          levelOrder[
            b.level as keyof typeof levelOrder
          ];


        if(levelCompare !==0){
          return levelCompare;
        }


        return a.number - b.number;
      }
    );


    return levels.map(level=>({

      level,

      list:
        sorted.filter(
          model =>
            model.level === level
        )

    }));

  },[models]);



  async function handleDelete(
    model:Model
  ){

    const confirmed =
      window.confirm(
        `Delete ${model.code}?`
      );


    if(!confirmed)
      return;


    try{

      const response =
        await fetch(
          `/api/models/${model.id}`,
          {
            method:"DELETE"
          }
        );


      if(!response.ok){
        throw new Error(
          "Delete failed."
        );
      }


      await loadModels(
        search,
        levelFilter
      );


    }catch(error){

      console.error(error);

    }

  }



  return (

    <div className="space-y-8">


      <div className="
        rounded-3xl
        border
        border-yellow-500/20
        bg-[#111111]
        p-6
      ">

        <div className="
          flex
          flex-col
          gap-4
          md:flex-row
          md:items-center
          md:justify-between
        ">


          <input

            value={search}

            onChange={
              e =>
              setSearch(
                e.target.value
              )
            }

            placeholder="
              Search by code, title, city or nationality
            "

            className="
              w-full
              rounded-2xl
              border
              border-yellow-500/20
              bg-[#181818]
              px-5
              py-4
              text-white
              md:max-w-xl
            "

          />


          <select

            value={levelFilter}

            onChange={
              e =>
              setLevelFilter(
                e.target.value
              )
            }


            className="
              rounded-2xl
              border
              border-yellow-500/20
              bg-[#181818]
              px-5
              py-4
              text-white
            "

          >

            <option value="ALL">
              All Levels
            </option>


            {levels.map(level=>(

              <option
                key={level}
                value={level}
              >

                {
                  level==="CROWN"
                  ? "👑 Crown"
                  : level
                }

              </option>

            ))}


          </select>


        </div>

      </div>




      {
        groupedModels.map(
          ({
            level,
            list
          })=>(


          <div

            key={level}

            className="
              rounded-3xl
              border
              border-yellow-500/20
              bg-[#111111]
              p-8
            "

          >


            <div className="
              flex
              items-center
              justify-between
            ">


              <h2 className="
                text-3xl
                font-bold
                text-yellow-500
              ">


                {
                  level==="CROWN"
                  ? "👑 Collection"
                  : `${level} Collection`
                }


              </h2>



              <span className="
                text-sm
                text-gray-400
              ">

                {list.length} profiles

              </span>


            </div>





            {
              loading ? (

                <p className="
                  mt-6
                  text-gray-400
                ">
                  Loading...
                </p>


              ) : list.length===0 ? (


                <p className="
                  mt-6
                  text-gray-400
                ">
                  No models yet.
                </p>


              ) : (


              <div className="
                mt-8
                grid
                gap-6
                md:grid-cols-2
                xl:grid-cols-3
                2xl:grid-cols-4
              ">


              {
                list.map(model=>(


                <div

                  key={model.id}

                  className="
                    rounded-2xl
                    border
                    border-yellow-500/20
                    bg-[#1a1a1a]
                    p-6
                  "

                >


                  <div className="
                    mb-4
                    flex
                    h-40
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-xl
                    bg-[#222]
                  ">


                    {
                      model.avatar ? (

                      <img

                        src={model.avatar}

                        alt={model.code}

                        className="
                          h-full
                          w-full
                          rounded-xl
                          object-cover
                        "

                      />

                      ):(

                      <span className="
                        text-gray-500
                      ">
                        No Avatar
                      </span>

                      )
                    }


                  </div>





                  <div className="space-y-3">


                    <div className="
                      flex
                      items-center
                      justify-between
                    ">


                      <p className="
                        font-bold
                        text-yellow-500
                      ">


                        {
                          model.level==="CROWN"
                          ? `👑 CY${model.number
    .toString()
    .padStart(3, "0")}`
                          : model.code
                        }


                      </p>



                      <span className="
                        rounded-full
                        border
                        border-yellow-500/20
                        px-2
                        py-1
                        text-[10px]
                        uppercase
                        tracking-[0.2em]
                        text-yellow-500
                      ">

                        {
                          model.online
                          ? "Online"
                          : "Offline"
                        }

                      </span>


                    </div>





                    <p className="
                      text-sm
                      text-white
                    ">

                      {
                        model.title ||
                        "Untitled profile"
                      }

                    </p>


                    <p className="
                      text-sm
                      text-gray-400
                    ">

                      {
                        model.city ||
                        "Unknown city"
                      }

                      {" • "}

                      {
                        model.nationality ||
                        "Unknown nationality"
                      }

                    </p>




                    <div className="
                      flex
                      gap-2
                      pt-2
                    ">


                      <button

                        onClick={()=>{

                          setSelectedModel(model);

                          setModalOpen(true);

                        }}

                        className="
                          rounded-full
                          border
                          border-yellow-500/30
                          px-4
                          py-2
                          text-yellow-400
                        "

                      >

                        Edit

                      </button>




                      <button

                        onClick={()=>
                          handleDelete(model)
                        }

                        className="
                          rounded-full
                          border
                          border-red-500/40
                          px-4
                          py-2
                          text-red-400
                        "

                      >

                        Delete

                      </button>



                    </div>



                  </div>



                </div>


                ))
              }


              </div>


              )

            }


          </div>


          )

        )
      }



      <EditModelModal

        open={modalOpen}

        model={selectedModel}

        onClose={()=>{

          setModalOpen(false);

          setSelectedModel(null);

        }}

        onSaved={()=>{

          loadModels(
            search,
            levelFilter
          );

        }}

      />


    </div>

  );
}