"use client";

import LevelCard from "./LevelCard";


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



interface LevelGridProps {

  models:Model[];

}



const levels = [
  "CROWN",
  "SSS",
  "SS",
  "S",
  "A",
] as const;



export default function LevelGrid({

  models,

}:LevelGridProps){


  return (

    <div
      className="
        space-y-20
      "
    >

      {
        levels.map((level)=>{


          const filteredModels =

            models.filter(
              (model)=>
                model.level === level
            );



          if(filteredModels.length === 0){

            return null;

          }



          return (

            <section

              key={level}

              className="
                space-y-8
              "

            >

              <h3

                className="
                  text-3xl
                  font-bold
                  text-yellow-500
                "

              >

                {
                  level === "CROWN"
                  ?
                  "👑 Crown Collection"
                  :
                  `${level} Collection`
                }

              </h3>



              <div

                className="
                  grid
                  grid-cols-1
                  gap-8
                  sm:grid-cols-2
                  lg:grid-cols-3
                "

              >

                {
                  filteredModels.map(

                    (model)=>(

                      <LevelCard

                        key={
                          model.id
                        }

                        model={
                          model
                        }

                      />

                    )

                  )
                }


              </div>


            </section>

          );


        })
      }


    </div>

  );

}