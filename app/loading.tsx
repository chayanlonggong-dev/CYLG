export default function Loading() {
  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-black
        text-white
      "
    >

      <div
        className="
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
            mt-3
            whitespace-nowrap
            text-[1.25rem]
            font-black
            leading-none
            tracking-[0.02em]
            sm:mt-6
            sm:text-5xl
            sm:tracking-[0.08em]
          "
        >
          ChaYanLongGong
        </h1>


        <p
          className="
            mt-4
            text-gray-400
          "
        >
          Luxury Elite Companion Agency
        </p>


        <div
          className="
            mx-auto
            mt-10
            h-1
            w-32
            overflow-hidden
            rounded-full
            bg-yellow-500/20
          "
        >

          <div
            className="
              h-full
              w-1/2
              animate-pulse
              rounded-full
              bg-yellow-500
            "
          />

        </div>


      </div>


    </main>
  );
}