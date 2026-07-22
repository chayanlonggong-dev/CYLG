"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";


export default function AdminLoginPage() {


  const router = useRouter();
  const searchParams = useSearchParams();


  const [username,setUsername] =
    useState("");

  const [password,setPassword] =
    useState("");

  const [showPassword,setShowPassword] =
    useState(false);

  const [error,setError] =
    useState("");

  const [loading,setLoading] =
    useState(false);





  const [sessionExpiredMessage,setSessionExpiredMessage] =
    useState("");
useEffect(() => {
  if (searchParams.get("expired") === "1") {
    setSessionExpiredMessage(
      "Your session has expired. Please log in again."
    );
  }
}, [searchParams]);

  function showPasswordTemporarily(){

    setShowPassword(true);

  }


  function hidePasswordTemporarily(){

    setShowPassword(false);

  }


  function handlePasswordKeyDown(
    e:React.KeyboardEvent<HTMLButtonElement>
  ){

    if(
      e.key === "Enter" ||
      e.key === " " ||
      e.key === "Spacebar"
    ){

      e.preventDefault();
      setShowPassword(true);

    }

  }


  function handlePasswordKeyUp(
    e:React.KeyboardEvent<HTMLButtonElement>
  ){

    if(
      e.key === "Enter" ||
      e.key === " " ||
      e.key === "Spacebar"
    ){

      e.preventDefault();
      setShowPassword(false);

    }

  }


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
          sessionExpiredMessage && (

            <div
              className="
                mb-5
                rounded-lg
                border
                border-yellow-500/20
                bg-yellow-500/10
                p-3
                text-center
                text-yellow-300
              "
            >

              {sessionExpiredMessage}

            </div>

          )
        }


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






        <div className="relative mb-8">

          <input

            type={showPassword ? "text" : "password"}

            placeholder="Password"

            value={password}

            onChange={(e)=>
              setPassword(
                e.target.value
              )
            }

            className="
              w-full
              rounded-xl
              border
              border-white/20
              bg-black
              px-5
              py-4
              pr-12
              text-white
            "

          />


          <button

            type="button"

            aria-label={
              showPassword
              ? "Hide password"
              : "Show password"
            }

            onMouseDown={showPasswordTemporarily}
            onMouseUp={hidePasswordTemporarily}
            onMouseLeave={hidePasswordTemporarily}
            onTouchStart={showPasswordTemporarily}
            onTouchEnd={hidePasswordTemporarily}
            onTouchCancel={hidePasswordTemporarily}
            onPointerDown={showPasswordTemporarily}
            onPointerUp={hidePasswordTemporarily}
            onPointerLeave={hidePasswordTemporarily}
            onKeyDown={handlePasswordKeyDown}
            onKeyUp={handlePasswordKeyUp}
            onBlur={hidePasswordTemporarily}

            className="
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              text-xl
              text-yellow-400/80
              transition
              hover:text-yellow-300
              focus:outline-none
            "

          >

            <span aria-hidden="true">
              👁
            </span>

          </button>

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