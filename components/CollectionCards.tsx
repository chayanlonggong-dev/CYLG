"use client";

import CollectionCard from "./collection/CollectionCard";

const models = [
  {
    id: "SS001",
    images: [
      "/models/SS001-1.jpg",
      "/models/SS001-2.jpg",
      "/models/SS001-3.jpg",
      "/models/SS001-4.jpg",
    ],
  },
];

export default function CollectionCards() {
  return (
    <section className="bg-black py-24 px-8">
      <div className="max-w-7xl mx-auto">

        {/* Section Title */}
        <div className="text-center mb-16">

          <p className="text-yellow-500 uppercase tracking-[0.4em]">
            FEATURED COLLECTION
          </p>

          <h2 className="text-5xl font-bold text-white mt-4">
            Elite Collection
          </h2>

          <p className="text-gray-500 mt-6">
            Select your exclusive companion.
          </p>

        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">

          {models.map((model) => (

            <CollectionCard
              key={model.id}
              id={model.id}
              images={model.images}
            />

          ))}

        </div>

      </div>
    </section>
  );
}