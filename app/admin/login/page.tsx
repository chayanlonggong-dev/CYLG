"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";


export default function AdminLoginPage() {


  const router = useRouter();


  const [username,setUsername] =
    useState("");

  const [password,setPassword] =
    useState("");

  const [error,setError] =
    useState("");

  const [loading,setLoading] =
    useState(false);





  async function handleSubmit(
    e:React.FormEvent
  ){

    e.preventDefault();


    setError("");

    setLoading(true);



    try{


      const response =
        await fetch(
          "/api/admin/login",
          {
            method:"POST",

            headers:{
              "Content-Type":
                "application/json",
            },

            body:JSON.stringify({

              username,

              password,

            }),

          }
        );




      const data =
        await response.json();





      if(!response.ok){

        throw new Error(
          data.message ||
          "Login failed."
        );

      }




      router.push(
        "/admin/dashboard"
      );


      router.refresh();




    }catch(error){


      setError(

        error instanceof Error
        ? error.message
        : "Login failed."

      );


    }finally{


      setLoading(false);


    }


  }







  return (

    <main
      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-black
        px-6
      "
    >


      <form

        onSubmit={handleSubmit}

        className="
          w-full
          max-w-md
          rounded-3xl
          border
          border-yellow-500/30
          bg-[#101010]
          p-10
        "

      >



        <h1
          className="
            mb-10
            text-center
            text-4xl
            font-bold
            text-yellow-400
          "
        >

          CYLG ADMIN

        </h1>





        {
          error && (

            <div
              className="
                mb-5
                rounded-lg
                bg-red-500/10
                p-3
                text-center
                text-red-400
              "
            >

              {error}

            </div>

          )
        }





        <input

          placeholder="Username"

          value={username}

          onChange={(e)=>
            setUsername(
              e.target.value
            )
          }

          className="
            mb-5
            w-full
            rounded-xl
            border
            border-white/20
            bg-black
            px-5
            py-4
            text-white
          "

        />






        <input

          type="password"

          placeholder="Password"

          value={password}

          onChange={(e)=>
            setPassword(
              e.target.value
            )
          }

          className="
            mb-8
            w-full
            rounded-xl
            border
            border-white/20
            bg-black
            px-5
            py-4
            text-white
          "

        />






        <button

          type="submit"

          disabled={loading}

          className="
            w-full
            rounded-xl
            bg-yellow-500
            py-4
            font-bold
            text-black
            hover:bg-yellow-400
            disabled:opacity-50
          "

        >

          {
            loading
            ? "LOGIN..."
            : "LOGIN"
          }


        </button>




      </form>


    </main>

  );


}