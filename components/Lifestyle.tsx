"use client";

export default function Lifestyle() {
  return (
    <section
      id="lifestyle"
      className="relative h-screen overflow-hidden"
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source
          src="/video/champagne.mp4"
          type="video/mp4"
        />
      </video>

      <div className="absolute inset-0 bg-black/60" />

      <div
        className="
          relative
          z-10
          flex
          h-full
          items-center
          justify-center
          px-6
        "
      >
        <div className="max-w-4xl text-center">
          <p
            className="
              text-sm
              uppercase
              tracking-[0.6em]
              text-yellow-400
            "
          >
            LIFESTYLE
          </p>

          <h2
            className="
              mt-6
              text-4xl
              font-black
              text-white
              sm:text-6xl
            "
            style={{
              fontFamily: "var(--font-cinzel)",
            }}
          >
            Luxury Lifestyle
          </h2>

          <p
            className="
              mx-auto
              mt-8
              max-w-2xl
              text-base
              leading-8
              text-gray-300
              sm:text-xl
              sm:leading-9
            "
          >
            Champagne. Elegance. Privacy.
            <br />
            Every moment is crafted for an unforgettable luxury experience.
          </p>
        </div>
      </div>
    </section>
  );
}