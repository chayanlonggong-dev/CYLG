import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();

    const file = data.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          message: "No file uploaded.",
        },
        {
          status: 400,
        }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "video"
    );

    await mkdir(uploadDir, {
      recursive: true,
    });

    const fileName =
      Date.now() +
      "-" +
      file.name.replace(/\s+/g, "-");

    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/video/${fileName}`,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Upload failed.",
      },
      {
        status: 500,
      }
    );
  }
}