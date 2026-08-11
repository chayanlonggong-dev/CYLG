import { prisma } from "./prisma";

type ModelLevel =
  | "CROWN"
  | "SSS"
  | "SS"
  | "S"
  | "A";

export async function getAllModels() {
  return prisma.model.findMany({
    orderBy: [
      {
        level: "asc",
      },
      {
        number: "asc",
      },
    ],
  });
}

export async function getModelById(id: number) {
  return prisma.model.findUnique({
    where: {
      id,
    },
  });
}

export async function generateModelCode(level: ModelLevel) {
  const latest = await prisma.model.findFirst({
    where: {
      level,
    },
    orderBy: {
      number: "desc",
    },
  });

  const nextNumber = latest
    ? latest.number + 1
    : 1;

  return {
    number: nextNumber,
    code: `${level}${String(nextNumber).padStart(3, "0")}`,
  };
}

export async function createModel(data: {
  level: ModelLevel;

  title?: string;

  nationality?: string;

  city?: string;

  age?: number;

  height?: number;

  weight?: number;

  languages?: string;

  services?: string;

  avatar?: string;

  gallery?: string;

  videos?: string;

  introduction?: string;

  introductionEn?: string;

  introductionZhTW?: string;

  introductionZhCN?: string;

  introductionJa?: string;

  introductionKo?: string;

  online?: boolean;

  featured?: boolean;
}) {
  const generated =
    await generateModelCode(data.level);

  const introduction =
    data.introduction ?? "";

  return prisma.model.create({
    data: {
      level: data.level,

      number: generated.number,

      code: generated.code,

      title:
        data.title ?? "",

      nationality:
        data.nationality ?? "",

      city:
        data.city ?? "",

      age:
        data.age ?? 18,

      height:
        data.height ?? 160,

      weight:
        data.weight ?? 50,

      languages:
        data.languages ?? "",

      services:
        data.services ?? "",

      avatar:
        data.avatar ?? "",

      gallery:
        data.gallery ?? "",

      videos:
        data.videos ?? "",

      introduction,

      introductionEn:
        data.introductionEn ??
        introduction,

      introductionZhTW:
        data.introductionZhTW ?? "",

      introductionZhCN:
        data.introductionZhCN ?? "",

      introductionJa:
        data.introductionJa ?? "",

      introductionKo:
        data.introductionKo ?? "",

      online:
        data.online ?? true,

      featured:
        data.featured ?? false,
    },
  });
}

export async function updateModel(
  id: number,

  data: {
    level?: ModelLevel;

    number?: number;

    code?: string;

    title?: string;

    nationality?: string;

    city?: string;

    age?: number;

    height?: number;

    weight?: number;

    languages?: string;

    services?: string;

    avatar?: string;

    gallery?: string;

    videos?: string;

    introduction?: string;

    introductionEn?: string;

    introductionZhTW?: string;

    introductionZhCN?: string;

    introductionJa?: string;

    introductionKo?: string;

    online?: boolean;

    featured?: boolean;
  }
) {
  return prisma.model.update({
    where: {
      id,
    },

    data,
  });
}

export async function deleteModel(id: number) {
  return prisma.model.delete({
    where: {
      id,
    },
  });
}