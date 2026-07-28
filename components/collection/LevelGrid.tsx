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

  onModelClick?:
    (model:Model)=>void;

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

  onModelClick,

}:LevelGridProps){



  return (

    <div

      className="
        space-y-16
      "

    >


      {

        levels.map(

          (level)=>(


            <div

              key={level}

            >


              {

                models.filter(

                  (model)=>

                    model.level === level

                ).length > 0 && (


                  <h3

                    className="
                      mb-8
                      text-center
                      text-2xl
                      font-bold
                      text-yellow-500
                    "

                  >

                    {level}

                  </h3>


                )

              }





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

                  models

                  .filter(

                    (model)=>

                      model.level === level

                  )

                  .map(

                    (model)=>(


                      <LevelCard


                        key={
                          model.id
                        }


                        model={
                          model
                        }


                        onClick={
                          onModelClick
                        }


                      />


                    )

                  )


                }


              </div>


            </div>


          )

        )

      }


    </div>

  );


}