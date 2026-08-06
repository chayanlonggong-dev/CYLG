import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const configPath = path.join(
  process.cwd(),
  "backup",
  "scheduler.json"
);

const defaultConfig = {
  enabled: false,
  day: "Sunday",
  time: "03:00",
  retention: 8,
};

function ensureConfig() {
  const backupDir = path.join(
    process.cwd(),
    "backup"
  );

  fs.mkdirSync(backupDir, {
    recursive: true,
  });

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(
      configPath,
      JSON.stringify(defaultConfig, null, 2),
      "utf8"
    );
  }
}

export async function GET() {
  try {
    ensureConfig();

    const config = JSON.parse(
      fs.readFileSync(configPath, "utf8")
    );

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load scheduler.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    ensureConfig();

    const body = await request.json();

    const config = {
      enabled:
        typeof body.enabled === "boolean"
          ? body.enabled
          : false,

      day:
        body.day ?? "Sunday",

      time:
        body.time ?? "03:00",

      retention:
        Number(body.retention) || 8,
    };

    fs.writeFileSync(
      configPath,
      JSON.stringify(config, null, 2),
      "utf8"
    );

    return NextResponse.json({
      success: true,
      message: "Scheduler updated successfully.",
      data: config,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save scheduler.",
      },
      {
        status: 500,
      }
    );
  }
}