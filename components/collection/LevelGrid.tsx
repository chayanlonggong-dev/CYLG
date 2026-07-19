"use client";

import LevelCard from "./LevelCard";


interface Model {

  level:
    | "CROWN"
    | "SSS"
    | "SS"
    | "S"
    | "A";

}



interface LevelGridProps {

  models: Model[];

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
}: LevelGridProps) {


  return (

    <div
      className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-3
        gap-8
      "
    >

      {
        levels.map((level)=>{


          const count =
            models.filter(
              (model)=>
                model.level === level
            ).length;



          return (

            <LevelCard

              key={level}

              level={level}

              count={count}

            />

          );


        })
      }


    </div>

  );


}