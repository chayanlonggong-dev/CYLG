import Image from "next/image";

interface ModelHeroProps {
  id: string;
  image: string;
}

export default function ModelHero({
  id,
  image,
}: ModelHeroProps) {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">

      {/* Background */}
      <Image
        src={image}
        alt={id}
        fill
        priority
        className="object-cover scale-105 transition-transform duration-[10000ms] hover:scale-110"
      />

      {/* Luxury Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black" />

      {/* Gold Glow */}
      <div className="absolute inset-0 bg-yellow-500/5" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">

        <p className="uppercase tracking-[0.6em] text-yellow-400 text-sm md:text-base mb-6">
          Luxury Elite Companion
        </p>

        <h1 className="text-7xl md:text-9xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
          {id}
        </h1>

        <div className="w-24 h-[2px] bg-yellow-400 mt-8 mb-8" />

        <p className="max-w-2xl text-gray-300 text-lg md:text-xl leading-8">
          Exclusive beauty, refined elegance and unforgettable luxury experiences.
          <br />
          Personalized companionship with absolute discretion.
        </p>

        <button
          className="
            mt-12
            px-12
            py-4
            rounded-full
            border
            border-yellow-400
            text-yellow-400
            uppercase
            tracking-[0.4em]
            font-semibold
            transition-all
            duration-500
            hover:bg-yellow-400
            hover:text-black
            hover:shadow-[0_0_40px_rgba(250,204,21,0.6)]
          "
        >
          BOOK NOW
        </button>

      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center">

        <span className="text-yellow-400 text-xs tracking-[0.4em] uppercase">
          Scroll
        </span>

        <div className="mt-3 h-10 w-[1px] bg-yellow-400 animate-pulse" />

      </div>

    </section>
  );
}