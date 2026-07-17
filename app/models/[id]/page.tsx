import { notFound } from "next/navigation";

import { models } from "../../data/models";

import ModelHero from "@/components/model/ModelHero";
import ModelGallery from "@/components/model/ModelGallery";
import ModelInfo from "@/components/model/ModelInfo";
import BookingCard from "@/components/model/BookingCard";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ModelPage({ params }: PageProps) {
  const { id } = await params;

  const model = models.find(
    (item) => item.id === id.toUpperCase()
  );

  if (!model) {
    notFound();
  }

  return (
    <main className="bg-black">
      <ModelHero
        id={model.id}
        image={model.images[0]}
      />

      <ModelGallery
        id={model.id}
        images={model.images}
      />

      <ModelInfo
        age={model.age}
        height={model.height}
        location={model.location}
        languages={model.languages}
        about={model.about}
      />

      <BookingCard
        whatsapp={model.whatsapp}
        telegram={model.telegram}
        signal={model.signal}
      />
    </main>
  );
}