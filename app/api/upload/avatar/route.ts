import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  console.log("========== AVATAR API ==========");

  try {
    console.log("Receiving form data...");

    const data = await request.formData();

    console.log("FormData OK");

    const file = data.get("file") as File;

    console.log("File:", file);

    if (!file) {
      console.log("No file uploaded.");

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

    console.log("ArrayBuffer OK");

    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "avatar"
    );

    console.log("Upload Directory:", uploadDir);

    await mkdir(uploadDir, {
      recursive: true,
    });

    const fileName =
      Date.now() +
      "-" +
      file.name.replace(/\s+/g, "-");

    console.log("File Name:", fileName);

    const filePath = path.join(uploadDir, fileName);

    console.log("Saving To:", filePath);

    await writeFile(filePath, buffer);

    console.log("Upload Success!");

    return NextResponse.json({
      success: true,
      url: `/uploads/avatar/${fileName}`,
    });

  } catch (error) {

    console.error("UPLOAD ERROR:");

    console.error(error);

    return NextResponse.json(
      {
        message: "Upload failed.",
        error: String(error),
      },
      {
        status: 500,
      }
    );
  }
}