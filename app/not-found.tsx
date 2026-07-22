export default function NotFound() {

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
            text-8xl
            font-black
            text-yellow-500
          "
        >
          404
        </h1>


        <h2
          className="
            mt-6
            text-4xl
            font-bold
          "
        >
          Page Not Found
        </h2>


        <p
          className="
            mt-6
            leading-8
            text-gray-400
          "
        >
          The page you are looking for does not exist.
        </p>


        <a

          href="/"

          className="
            mt-10
            inline-block
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

          Back Home

        </a>


      </div>


    </main>

  );

}