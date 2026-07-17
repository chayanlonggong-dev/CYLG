export default function LuxuryExperience() {
  return (
    <section className="bg-black py-24 px-6">

      <div className="max-w-7xl mx-auto text-center">

        <p className="uppercase tracking-[0.35em] text-yellow-500 mb-4">
          WHY CHOOSE CYLG
        </p>

        <h2 className="text-5xl font-bold text-white">
          Luxury Beyond Expectations
        </h2>

        <p className="mt-8 text-gray-400 text-lg max-w-3xl mx-auto">
          Every arrangement is carefully curated to deliver elegance,
          discretion and a truly first-class private experience.
        </p>

      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mt-20">

        <div className="bg-zinc-900 rounded-3xl p-10 border border-zinc-800">
          <h3 className="text-yellow-400 text-2xl font-bold mb-4">
            Worldwide Arrangement
          </h3>

          <p className="text-gray-400 leading-8">
            Private luxury companion arrangements tailored for international
            clients with flexible scheduling and premium service.
          </p>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-10 border border-zinc-800">
          <h3 className="text-yellow-400 text-2xl font-bold mb-4">
            VIP Standard
          </h3>

          <p className="text-gray-400 leading-8">
            Carefully selected companions, elegant presentation and exceptional
            attention to every detail.
          </p>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-10 border border-zinc-800">
          <h3 className="text-yellow-400 text-2xl font-bold mb-4">
            Absolute Privacy
          </h3>

          <p className="text-gray-400 leading-8">
            Confidential communication and completely private arrangements for
            every distinguished client.
          </p>
        </div>

      </div>

    </section>
  );
}