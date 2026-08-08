import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_CONFIG = {
  enabled: false,
  day: "Sunday",
  time: "03:00",
  retention: 8,
};

function normalizeConfig(config: {
  enabled: boolean;
  day: string;
  time: string;
  retention: number;
}) {
  return {
    enabled: config.enabled,
    day: config.day,
    time: config.time,
    retention: Math.max(
      1,
      Math.min(
        52,
        Number(config.retention) || 8
      )
    ),
  };
}

async function getOrCreateScheduler() {
  const existing =
    await prisma.backupScheduler.findUnique({
      where: {
        id: 1,
      },
    });

  if (existing) {
    return existing;
  }

  return prisma.backupScheduler.create({
    data: {
      id: 1,
      enabled: DEFAULT_CONFIG.enabled,
      day: DEFAULT_CONFIG.day,
      time: DEFAULT_CONFIG.time,
      retention: DEFAULT_CONFIG.retention,
    },
  });
}

export async function GET() {
  try {
    const scheduler =
      await getOrCreateScheduler();

    const config = normalizeConfig({
      enabled: scheduler.enabled,
      day: scheduler.day,
      time: scheduler.time,
      retention: scheduler.retention,
    });

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error(
      "GET BACKUP SCHEDULER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load scheduler.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const enabled =
      typeof body.enabled ===
      "boolean"
        ? body.enabled
        : DEFAULT_CONFIG.enabled;

    const day =
      typeof body.day === "string" &&
      body.day.trim()
        ? body.day.trim()
        : DEFAULT_CONFIG.day;

    const time =
      typeof body.time === "string" &&
      /^\d{2}:\d{2}$/.test(
        body.time.trim()
      )
        ? body.time.trim()
        : DEFAULT_CONFIG.time;

    const retentionNumber =
      Number(body.retention);

    const retention =
      Number.isFinite(
        retentionNumber
      )
        ? Math.max(
            1,
            Math.min(
              52,
              Math.floor(
                retentionNumber
              )
            )
          )
        : DEFAULT_CONFIG.retention;

    const scheduler =
      await prisma.backupScheduler.upsert(
        {
          where: {
            id: 1,
          },

          update: {
            enabled,
            day,
            time,
            retention,
          },

          create: {
            id: 1,
            enabled,
            day,
            time,
            retention,
          },
        }
      );

    const config = normalizeConfig({
      enabled:
        scheduler.enabled,

      day:
        scheduler.day,

      time:
        scheduler.time,

      retention:
        scheduler.retention,
    });

    return NextResponse.json({
      success: true,
      message:
        "Scheduler updated successfully.",
      data: config,
    });
  } catch (error) {
    console.error(
      "POST BACKUP SCHEDULER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to save scheduler.",
      },
      {
        status: 500,
      }
    );
  }
}