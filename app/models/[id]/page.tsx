import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

import ModelHero from "@/components/model/ModelHero";
import ModelGallery from "@/components/model/ModelGallery";
import ModelInfo from "@/components/model/ModelInfo";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ModelPage({
  params,
}: PageProps) {
  const { id } = await params;

  const model = await prisma.model.findFirst({
    where: {
      code: id,
    },
  });

  if (!model) {
    notFound();
  }

  const settings = await prisma.websiteSettings.findUnique({
    where: {
      id: 1,
    },
  });

  const gallery = model.gallery
    ? model.gallery.split(",")
    : [];

  const languages = model.languages
    ? model.languages.split(",")
    : [];

  return (
    <main className="bg-black min-h-screen">

      <ModelHero
        id={model.code}
        image={model.avatar}
        whatsapp={settings?.whatsapp || ""}
        telegram={settings?.telegram || ""}
        signal={settings?.signal || ""}
        line={settings?.line || ""}
        wechatQr={settings?.wechatQr || ""}
        enableWhatsapp={settings?.enableWhatsApp ?? false}
        enableTelegram={settings?.enableTelegram ?? false}
        enableSignal={settings?.enableSignal ?? false}
        enableLine={settings?.enableLine ?? false}
        enableWechat={settings?.enableWechat ?? false}
      />

      <ModelGallery
        id={model.code}
        images={[
          model.avatar,
          ...gallery,
        ]}
      />

      <ModelInfo
        age={model.age}
        height={model.height}
        city={model.city}
        nationality={model.nationality}
        languages={languages}
        introduction={model.introduction || ""}
      />

    </main>
  );
}