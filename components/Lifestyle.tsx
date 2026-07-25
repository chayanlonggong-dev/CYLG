"use client";

const sections = [
  {
    video: "/video/champagne.mp4",
    title: "Luxury Lifestyle",
    description:
      "Champagne. Elegance. Privacy. Every moment is crafted for an unforgettable luxury experience.",
  },
  {
    video: "/video/lounge.mp4",
    title: "Private Lounge",
    description:
      "Exclusive atmosphere designed for distinguished guests seeking comfort, discretion and refinement.",
  },  {
    video: "/video/penthouse.mp4",
    title: "Luxury Penthouse",
    description:
      "Breathtaking skyline views with world-class luxury and absolute privacy.",
  },
  {
    video: "/video/skyline-pool.mp4",
    title: "Skyline Pool",
    description:
      "Relax above the city with an unforgettable infinity pool experience.",
  },
  {
    video: "/video/woman-walk.mp4",
    title: "Elegant Arrival",
    description:
      "Confidence, elegance and irresistible charm in every step.",
  },
  {
    video: "/video/woman-window.mp4",
    title: "Private Moments",
    description:
      "Quiet luxury surrounded by breathtaking city lights.",
  },
  {
    video: "/video/whisky.mp4",
    title: "Luxury Night",
    description:
      "Premium whisky, refined atmosphere and unforgettable evenings.",
  },
];

export default function Lifestyle() {
  return (
    <section id="lifestyle" className="bg-[#050505]">
      {sections.map((item) => (
        <section
          key={item.video}
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
            <source src={item.video} type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-black/60" />

          <div className="relative z-10 flex h-full items-center justify-center px-6">
            <div className="max-w-4xl text-center">
              <p className="text-sm uppercase tracking-[0.6em] text-yellow-400">
                LIFESTYLE
              </p>

              <h2
                className="mt-6 text-4xl font-black text-white sm:text-6xl"
                style={{
                  fontFamily: "var(--font-cinzel)",
                }}
              >
                {item.title}
              </h2>

              <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-gray-300 sm:text-xl sm:leading-9">
                {item.description}
              </p>
            </div>
          </div>
        </section>
      ))}
    </section>
  );
}