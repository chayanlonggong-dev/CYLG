import { prisma } from "./prisma";

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

export async function createModel(data: {
  level: "S" | "SS" | "SSS";
  number: number;
  avatar: string;
  gallery: string;
  videos: string;
  introduction: string;
}) {
  return prisma.model.create({
    data,
  });
}

export async function updateModel(
  id: number,
  data: {
    level?: "S" | "SS" | "SSS";
    number?: number;
    avatar?: string;
    gallery?: string;
    videos?: string;
    introduction?: string;
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