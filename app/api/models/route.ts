import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const levelOrder = {
  CROWN: 0,
  SSS: 1,
  SS: 2,
  S: 3,
  A: 4,
} as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const level = searchParams.get("level")?.trim() || "";

    const models = await prisma.model.findMany({
      where: {
        ...(level && level !== "ALL"
          ? {
              level: level as any,
            }
          : {}),

        ...(search
          ? {
              OR: [
                {
                  code: {
                    contains: search,
                  },
                },
                {
                  title: {
                    contains: search,
                  },
                },
                {
                  nationality: {
                    contains: search,
                  },
                },
                {
                  city: {
                    contains: search,
                  },
                },
              ],
            }
          : {}),
      },
    });

    models.sort((a: { level: string; number: number }, b: { level: string; number: number }) => {
      const levelCompare =
        levelOrder[a.level as keyof typeof levelOrder] -
        levelOrder[b.level as keyof typeof levelOrder];

      if (levelCompare !== 0) {
        return levelCompare;
      }

      return a.number - b.number;
    });

    return NextResponse.json(models);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to fetch models.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const lastModel = await prisma.model.findFirst({
      where: {
        level: body.level,
      },
      orderBy: {
        number: "desc",
      },
    });

    const nextNumber = lastModel ? lastModel.number + 1 : 1;

    const code =
      body.level + String(nextNumber).padStart(3, "0");

    const model = await prisma.model.create({
      data: {
        level: body.level,
        number: nextNumber,
        code,

        title: body.title ?? "",
        nationality: body.nationality ?? "",
        city: body.city ?? "",

        age: Number(body.age ?? 18),
        height: Number(body.height ?? 160),
        weight: Number(body.weight ?? 50),

        languages: body.languages ?? "",
        services: body.services ?? "",

        avatar: body.avatar ?? "",
        gallery: body.gallery ?? "",
        videos: body.videos ?? "",

        introduction: body.introduction ?? "",

        online: body.online ?? true,
        featured: body.featured ?? false,
      },
    });

    return NextResponse.json(model);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Create model failed.",
      },
      {
        status: 500,
      }
    );
  }
}