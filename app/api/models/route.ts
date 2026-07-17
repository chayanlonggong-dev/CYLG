import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const models = await prisma.model.findMany({
      orderBy: [
        {
          level: "asc",
        },
        {
          number: "asc",
        },
      ],
    });

    return NextResponse.json(models);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to fetch models.",
        error: String(error),
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

    const code = `${body.level}${String(nextNumber).padStart(3, "0")}`;

    const model = await prisma.model.create({
      data: {
        level: body.level,
        number: nextNumber,
        code,

        avatar: body.avatar ?? "",
        gallery: body.gallery ?? "",
        videos: body.videos ?? "",

        title: body.title ?? "",
        nationality: body.nationality ?? "",
        city: body.city ?? "",

        age: Number(body.age ?? 18),
        height: Number(body.height ?? 160),
        weight: Number(body.weight ?? 50),

        languages: body.languages ?? "",
        services: body.services ?? "",

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
        error: String(error),
      },
      {
        status: 500,
      }
    );
  }
}