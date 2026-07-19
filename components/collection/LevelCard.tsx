import Link from "next/link";


interface LevelCardProps {

  level:
    | "CROWN"
    | "SSS"
    | "SS"
    | "S"
    | "A";

  count: number;

}



const levelConfig = {

  CROWN: {
    title: "👑 Crown Collection",
    subtitle: "Ultimate Exclusive",
  },


  SSS: {
    title: "SSS Collection",
    subtitle: "Elite Selection",
  },


  SS: {
    title: "SS Collection",
    subtitle: "Premium Selection",
  },


  S: {
    title: "S Collection",
    subtitle: "Selected Collection",
  },


  A: {
    title: "A Collection",
    subtitle: "Classic Selection",
  },

};



export default function LevelCard({

  level,
  count,

}: LevelCardProps) {


  const config = levelConfig[level];



  return (

    <Link

      href={`/collection/${level}`}

      className="
        group
        block
        rounded-3xl
        border
        border-yellow-500/20
        bg-[#111111]
        p-10
        transition-all
        duration-700
        hover:-translate-y-3
        hover:border-yellow-400
        hover:shadow-[0_0_50px_rgba(255,215,0,.18)]
      "

    >


      <div className="space-y-6">


        <h2
          className="
            text-3xl
            font-bold
            text-yellow-500
          "
        >

          {config.title}

        </h2>



        <p
          className="
            text-gray-400
            tracking-widest
            uppercase
          "
        >

          {config.subtitle}

        </p>



        <div
          className="
            flex
            items-end
            gap-3
          "
        >

          <span
            className="
              text-5xl
              font-black
              text-white
            "
          >

            {count}

          </span>


          <span
            className="
              pb-2
              text-gray-500
            "
          >

            Profiles

          </span>


        </div>


      </div>


    </Link>

  );

}