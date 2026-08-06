import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import os from "os";
import { performance } from "perf_hooks";

export async function GET() {
  try {
    let database = "Disconnected";
    let databasePing = 0;

    try {
      const start = performance.now();

      await prisma.$queryRaw`SELECT 1`;

      databasePing = Math.round(
        performance.now() - start
      );

      database = "Connected";
    } catch {
      database = "Disconnected";
    }

    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    const totalGB = Math.round(
      totalMemory / 1024 / 1024 / 1024
    );

    const freeGB = Math.round(
      freeMemory / 1024 / 1024 / 1024
    );

    const usedGB = Math.round(
      usedMemory / 1024 / 1024 / 1024
    );

    const memoryUsage = Math.round(
      (usedMemory / totalMemory) * 100
    );

    const cpuInfo = os.cpus();

    const health =
      database === "Connected"
        ? "Healthy"
        : "Warning";

    return NextResponse.json({
      success: true,

      data: {
        server: "Online",

        database,

        databasePing,

        health,

        environment:
          process.env.NODE_ENV,

        platform: os.platform(),

        hostname: os.hostname(),

        uptime: Math.floor(
          os.uptime()
        ),

        memory: {
          total: totalGB,

          free: freeGB,

          used: usedGB,

          usage: memoryUsage,
        },

        cpu: {
          cores: cpuInfo.length,

          model:
            cpuInfo[0]?.model ??
            "Unknown CPU",

          usage: null,
        },

        disk: {
          total: null,

          free: null,

          used: null,

          usage: null,
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
        message:
          "Failed to load system information.",
      },
      {
        status: 500,
      }
    );
  }
}