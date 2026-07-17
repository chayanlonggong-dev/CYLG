export default function Hero() {
  return (
    <section className="relative h-screen overflow-hidden">

      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/video/hero.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="text-center px-6">

          <p className="text-yellow-400 tracking-[0.4em] uppercase">
            LUXURY ELITE COMPANION SERVICE
          </p>

          <h1 className="mt-6 text-7xl font-black text-white">
            ChaYanLongGong
          </h1>

          <h2 className="mt-6 text-5xl font-bold text-yellow-400">
            Luxury Without Borders
          </h2>

          <p className="mt-8 text-xl text-white">
            Exclusive companion experiences with worldwide private arrangements.
            <br />
            Discreet. Elegant. Personalized.
          </p>

        </div>
      </div>

    </section>
  );
}