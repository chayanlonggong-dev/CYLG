import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    const model = await prisma.model.findFirst({
      where: {
        code: id,
      },
    });

    if (!model) {
      return NextResponse.json(
        {
          message: "Model not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(model);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to fetch model.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const model = await prisma.model.update({
      where: {
        code: id,
      },
      data: {
        level: body.level,
        number: Number(body.number),

        title: body.title ?? "",
        age: Number(body.age),
        height: Number(body.height),
        weight: Number(body.weight),

        nationality: body.nationality ?? "",
        city: body.city ?? "",

        languages: body.languages ?? "",
        services: body.services ?? "",

        avatar: body.avatar ?? "",
        gallery: body.gallery ?? "",
        videos: body.videos ?? "",

        introduction: body.introduction ?? "",

        online: Boolean(body.online),
        featured: Boolean(body.featured),
      },
    });

    return NextResponse.json(model);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Update failed.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    await prisma.model.delete({
      where: {
        code: id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Delete failed.",
      },
      {
        status: 500,
      }
    );
  }
}