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
  level: "CROWN" | "SSS" | "SS" | "S" | "A";
  number: number;
  code: string;
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
  online?: boolean;
  featured?: boolean;
}) {
  return prisma.model.create({
    data,
  });
}

export async function updateModel(
  id: number,
  data: {
    level?: "CROWN" | "SSS" | "SS" | "S" | "A";
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