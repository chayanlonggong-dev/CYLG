import { prisma } from "./prisma";

type ModelLevel =
  | "CROWN"
  | "SSS"
  | "SS"
  | "S"
  | "A";


const LEVEL_ORDER: ModelLevel[] = [
  "CROWN",
  "SSS",
  "SS",
  "S",
  "A",
];


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



/**
 * Auto generate model number
 *
 * SS001
 * SS002
 */
export async function generateModelCode(
  level: ModelLevel
) {

  const latest =
    await prisma.model.findFirst({
      where: {
        level,
      },
      orderBy: {
        number: "desc",
      },
    });


  const nextNumber =
    latest
      ? latest.number + 1
      : 1;


  const code =
    `${level}${String(nextNumber).padStart(3, "0")}`;


  return {
    number: nextNumber,
    code,
  };

}



/**
 * Create Model
 *
 * Auto number + code
 */
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

  online?: boolean;

  featured?: boolean;

}) {


  const generated =
    await generateModelCode(
      data.level
    );


  return prisma.model.create({

    data: {

      ...data,

      number:
        generated.number,

      code:
        generated.code,

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





export async function deleteModel(
  id: number
) {

  return prisma.model.delete({

    where: {
      id,
    },

  });

}