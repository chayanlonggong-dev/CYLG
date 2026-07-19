"use client";


import { useState } from "react";



interface ModelHeroProps {

  id:string;

  image:string;

}



function displayModelTitle(id:string){


  if(id.startsWith("CROWN")){

    const number=id.replace("CROWN","");


    return {

      crown:true,

      title:`CY${number}`,

    };

  }



  return {

    crown:false,

    title:id,

  };


}




export default function ModelHero({

  id,

  image,

}:ModelHeroProps){



  const [open,setOpen]=useState(false);



  const display=displayModelTitle(id);



  const message=

    encodeURIComponent(
      `Hi, I'm interested in ${id}`
    );



  return (


    <section

      className="
        relative
        min-h-[700px]
        flex
        items-center
        justify-center
        overflow-hidden
        bg-black
      "

    >



      {
        image &&

        <img

          src={image}

          alt={id}

          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            opacity-40
          "

        />

      }





      <div

        className="
          absolute
          inset-0
          bg-black/70
        "

      />





      <div

        className="
          relative
          z-10
          text-center
        "

      >



        <p

          className="
            mb-8
            text-sm
            tracking-[0.8em]
            text-yellow-500
            uppercase
          "

        >

          Luxury Elite Companion

        </p>





        <h1

          className="
            text-7xl
            md:text-9xl
            font-black
            tracking-[0.25em]
            uppercase
            text-black
          "

          style={{

            WebkitTextStroke:"4px #D4AF37",

            textShadow:
            "0 0 25px rgba(212,175,55,.8)",

          }}

        >

          {display.crown && "👑 "}

          {display.title}


        </h1>





        <div

          className="
            mx-auto
            mt-10
            h-[2px]
            w-32
            bg-yellow-500
          "

        />





        <p

          className="
            mt-10
            text-lg
            text-gray-300
          "

        >

          Exclusive beauty, refined elegance and unforgettable luxury experiences.

          <br/>

          Personalized companionship with absolute discretion.

        </p>






        <button

          onClick={()=>setOpen(true)}

          className="
            mt-14
            rounded-full
            border
            border-yellow-500
            px-12
            py-4
            text-yellow-500
            tracking-[0.4em]
            hover:bg-yellow-500
            hover:text-black
            transition-all
          "

        >

          BOOK NOW


        </button>





      </div>







      {
        open &&


        <div

          className="
            fixed
            inset-0
            z-50
            bg-black/90
            flex
            items-center
            justify-center
          "

        >



          <div

            className="
              bg-[#111]
              border
              border-yellow-500/40
              rounded-2xl
              p-10
              w-[90%]
              max-w-md
              text-center
            "

          >



            <button

              onClick={()=>setOpen(false)}

              className="
                text-white
                text-4xl
                absolute
                top-8
                right-10
              "

            >

              ×

            </button>





            <h2

              className="
                text-yellow-400
                tracking-[0.4em]
                text-xl
                mb-8
              "

            >

              BOOK NOW

            </h2>





            <p

              className="
                text-gray-300
                mb-8
              "

            >

              Model ID : {id}

            </p>






            <div className="space-y-4">



              <a

                href={`https://wa.me/?text=${message}`}

                target="_blank"

                className="
                  block
                  border
                  border-green-500
                  text-green-400
                  py-3
                  rounded-full
                "

              >

                WhatsApp

              </a>





              <a

                href={`https://t.me/share/url?text=${message}`}

                target="_blank"

                className="
                  block
                  border
                  border-blue-500
                  text-blue-400
                  py-3
                  rounded-full
                "

              >

                Telegram

              </a>





              <a

                href="#"

                className="
                  block
                  border
                  border-gray-400
                  text-gray-300
                  py-3
                  rounded-full
                "

              >

                Signal

              </a>



            </div>



          </div>


        </div>


      }



    </section>


  );


}