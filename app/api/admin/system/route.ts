import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import os from "os";

export async function GET() {
  try {
    let database = "Disconnected";

    try {
      await prisma.$queryRaw`SELECT 1`;
      database = "Connected";
    } catch {
      database = "Disconnected";
    }

    return NextResponse.json({
      success: true,
      data: {
        server: "Online",

        database,

        environment: process.env.NODE_ENV,

        platform: os.platform(),

        hostname: os.hostname(),

        uptime: Math.floor(os.uptime()),

        memory: {
          total: Math.round(
            os.totalmem() / 1024 / 1024 / 1024
          ),

          free: Math.round(
            os.freemem() / 1024 / 1024 / 1024
          ),
        },

        cpu: {
          cores: os.cpus().length,

          model:
            os.cpus()[0]?.model ??
            "Unknown CPU",
        },

        node: process.version,

        next: "16.2.10",

        react: "19.2.4",

        prisma: "6.19.3",

        version: "0.1.0",
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load system information.",
      },
      {
        status: 500,
      }
    );
  }
}