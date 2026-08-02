import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const onlineTime = new Date(
      now.getTime() - 5 * 60 * 1000
    );

    const [
      totalVisits,
      todayVisits,
      uniqueVisitors,
      onlineVisitors,
      topPages,
      recentVisitors,
    ] = await Promise.all([

      prisma.analyticsVisit.count(),

      prisma.analyticsVisit.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),

      prisma.analyticsVisit.findMany({
        distinct: ["visitorId"],
        select: {
          visitorId: true,
        },
      }),

      prisma.analyticsVisit.findMany({
        where: {
          createdAt: {
            gte: onlineTime,
          },
        },
        distinct: ["visitorId"],
        select: {
          visitorId: true,
        },
      }),

      prisma.analyticsVisit.groupBy({
        by: ["path"],
        _count: {
          path: true,
        },
        orderBy: {
          _count: {
            path: "desc",
          },
        },
        take: 10,
      }),

      prisma.analyticsVisit.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
        select: {
          createdAt: true,
          path: true,
          country: true,
          browser: true,
          device: true,
        },
      }),

    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalVisits,
        todayVisits,
        uniqueVisitors: uniqueVisitors.length,
        onlineVisitors: onlineVisitors.length,
        topPages,
        recentVisitors,
      },
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load analytics.",
      },
      {
        status: 500,
      }
    );

  }
}