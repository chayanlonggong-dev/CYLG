"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";



export default function AdminLoginPage() {


  const router =
    useRouter();



  const [username,setUsername] =
    useState("");

  const [password,setPassword] =
    useState("");

  const [error,setError] =
    useState("");

  const [loading,setLoading] =
    useState(false);





  async function handleLogin(
    event:React.FormEvent
  ){

    event.preventDefault();


    setError("");

    setLoading(true);




    try {


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




      router.push("/admin");

      router.refresh();





    } catch(error){


      setError(

        error instanceof Error

          ? error.message

          : "Login failed."

      );



    } finally {


      setLoading(false);


    }


  }







  return (

    <main
      className="
        min-h-screen
        bg-black
        flex
        items-center
        justify-center
        px-6
      "
    >


      <form

        onSubmit={handleLogin}

        className="
          w-full
          max-w-md
          rounded-3xl
          border
          border-yellow-500/30
          bg-[#111]
          p-10
        "

      >



        <h1
          className="
            mb-8
            text-center
            text-4xl
            font-bold
            text-yellow-400
          "
        >
          CYLG ADMIN
        </h1>





        {error && (

          <p
            className="
              mb-5
              rounded-lg
              bg-red-900/40
              p-3
              text-center
              text-sm
              text-red-400
            "
          >
            {error}
          </p>

        )}






        <div className="mb-5">


          <label
            className="
              mb-2
              block
              text-sm
              text-gray-400
            "
          >
            Username
          </label>



          <input

            value={username}

            onChange={(e)=>
              setUsername(e.target.value)
            }

            className="
              w-full
              rounded-xl
              border
              border-white/20
              bg-black
              px-5
              py-4
              text-white
              outline-none
            "

          />

        </div>






        <div className="mb-8">


          <label
            className="
              mb-2
              block
              text-sm
              text-gray-400
            "
          >
            Password
          </label>




          <input

            type="password"

            value={password}

            onChange={(e)=>
              setPassword(e.target.value)
            }

            className="
              w-full
              rounded-xl
              border
              border-white/20
              bg-black
              px-5
              py-4
              text-white
              outline-none
            "

          />

        </div>







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
            transition
            hover:bg-yellow-400
            disabled:opacity-50
          "

        >

          {loading
            ? "LOGIN..."
            : "LOGIN"
          }


        </button>




      </form>


    </main>

  );

}