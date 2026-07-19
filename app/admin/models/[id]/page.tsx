import { prisma } from "@/lib/prisma";

import ModelHero from "@/components/model/ModelHero";
import ModelGallery from "@/components/model/ModelGallery";
import ModelInfo from "@/components/model/ModelInfo";
import BookingCard from "@/components/model/BookingCard";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ModelPage({
  params,
}: PageProps) {
  const { id } = await params;

  const model = await prisma.model.findUnique({
    where: {
      code: id,
    },
  });

  if (!model) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1 className="text-3xl text-yellow-500">
          Model Not Found
        </h1>
      </main>
    );
  }

  const gallery =
    model.gallery && model.gallery.length > 0
      ? model.gallery.split(",")
      : [];

  const languages =
    model.languages && model.languages.length > 0
      ? model.languages.split(",")
      : [];

  const settings = await prisma.websiteSettings.findUnique({
    where: {
      id: 1,
    },
  });

  return (
    <main className="min-h-screen bg-black text-white">

      <ModelHero
        id={model.code}
        image={model.avatar}
      />

      <ModelGallery
        id={model.code}
        images={[model.avatar, ...gallery]}
      />

      <ModelInfo
        age={model.age}
        height={model.height}
        city={model.city}
        nationality={model.nationality}
        languages={languages}
        introduction={model.introduction}
      />

      <BookingCard
        modelId={model.code}
        whatsapp={settings?.whatsapp || ""}
        telegram={settings?.telegram || ""}
        signal={settings?.signal || ""}
      />

    </main>
  );
}