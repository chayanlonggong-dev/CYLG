"use client";

const services = [
  {
    title: "Companion Booking",
    description:
      "Private luxury companion arrangements tailored for every occasion.",
  },
  {
    title: "Travel Companion",
    description:
      "Business trips, vacations and international travel experiences.",
  },
  {
    title: "VIP Events",
    description:
      "Exclusive parties, luxury events and premium entertainment.",
  },
  {
    title: "Private Dining",
    description:
      "Fine dining experiences in complete privacy.",
  },
];

export default function Services() {
  return (
    <section
      id="services"
      className="bg-[#0B0B0B] px-6 py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.6em] text-yellow-400">
            SERVICES
          </p>

          <h2 className="mt-6 text-5xl font-black text-white">
            Luxury Services
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-9 text-gray-300">
            Personalized premium experiences with absolute privacy and world-class service.
          </p>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.title}
              className="
                rounded-3xl
                border
                border-yellow-500/20
                bg-[#111111]
                p-10
                transition
                duration-300
                hover:border-yellow-400
              "
            >
              <h3 className="text-2xl font-bold text-yellow-400">
                {service.title}
              </h3>

              <p className="mt-6 leading-8 text-gray-300">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}