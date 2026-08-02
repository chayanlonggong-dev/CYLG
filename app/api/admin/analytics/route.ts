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
      topCountries,
      topBrowsers,
      topDevices,
      topReferrers,
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

      prisma.analyticsVisit.groupBy({
        by: ["country"],
        _count: {
          country: true,
        },
        orderBy: {
          _count: {
            country: "desc",
          },
        },
        take: 10,
      }),

      prisma.analyticsVisit.groupBy({
        by: ["browser"],
        _count: {
          browser: true,
        },
        orderBy: {
          _count: {
            browser: "desc",
          },
        },
        take: 10,
      }),

      prisma.analyticsVisit.groupBy({
        by: ["device"],
        _count: {
          device: true,
        },
        orderBy: {
          _count: {
            device: "desc",
          },
        },
        take: 10,
      }),

      prisma.analyticsVisit.groupBy({
        by: ["referrer"],
        _count: {
          referrer: true,
        },
        orderBy: {
          _count: {
            referrer: "desc",
          },
        },
        take: 10,
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
        topCountries,
        topBrowsers,
        topDevices,
        topReferrers,
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