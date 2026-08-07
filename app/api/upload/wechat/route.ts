import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
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
      "wechat"
    );

    fs.mkdirSync(uploadDir, {
      recursive: true,
    });

    const fileName = `${Date.now()}-${file.name}`;

    fs.writeFileSync(
      path.join(uploadDir, fileName),
      buffer
    );

    return NextResponse.json({
      success: true,
      url: `/uploads/wechat/${fileName}`,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Upload failed.",
      },
      {
        status: 500,
      }
    );
  }
}