"use client";

export default function Error({

  reset,

}: {

  reset: () => void;

}) {


  return (

    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-black
        px-6
        text-white
      "
    >

      <div
        className="
          max-w-xl
          text-center
        "
      >

        <p
          className="
            text-sm
            uppercase
            tracking-[0.5em]
            text-yellow-500
          "
        >
          CYLG
        </p>


        <h1
          className="
            mt-6
            text-5xl
            font-black
          "
        >
          Something Went Wrong
        </h1>


        <p
          className="
            mt-6
            leading-8
            text-gray-400
          "
        >
          We are unable to load this page right now.
          Please try again.
        </p>


        <button

          onClick={() => reset()}

          className="
            mt-10
            rounded-full
            border
            border-yellow-500
            px-8
            py-4
            font-bold
            uppercase
            tracking-[0.2em]
            text-yellow-500
            transition
            hover:bg-yellow-500
            hover:text-black
          "

        >

          Try Again

        </button>


      </div>


    </main>

  );

}