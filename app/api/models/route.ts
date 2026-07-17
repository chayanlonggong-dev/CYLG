import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const models = await prisma.model.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(models);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to fetch models.",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const code = `${body.level}${String(body.number).padStart(3, "0")}`;

    const model = await prisma.model.create({
      data: {
        level: body.level,
        number: Number(body.number),
        code,
        avatar: body.avatar ?? "",
        gallery: body.gallery ?? "",
        videos: body.videos ?? "",
        introduction: body.introduction ?? "",
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
      { status: 500 }
    );
  }
}