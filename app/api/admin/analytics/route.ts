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

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

const weekStart = new Date(today);
weekStart.setDate(today.getDate() - today.getDay());

const monthStart = new Date(
  today.getFullYear(),
  today.getMonth(),
  1
);
    const [
  totalVisits,
  todayVisits,
  yesterdayVisits,
  weekVisits,
  monthVisits,
  uniqueVisitors,
  onlineVisitors,
  topPages,
  recentVisitors,
  topCountries,
  topBrowsers,
  topDevices,
  topReferrers,
  traffic,
  bookingPlatforms,
  topModels,
] = await Promise.all([

      prisma.analyticsVisit.count(),

      prisma.analyticsVisit.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
      
prisma.analyticsVisit.count({
  where: {
    createdAt: {
      gte: yesterday,
      lt: today,
    },
  },
}),

prisma.analyticsVisit.count({
  where: {
    createdAt: {
      gte: weekStart,
    },
  },
}),

prisma.analyticsVisit.count({
  where: {
    createdAt: {
      gte: monthStart,
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

      prisma.analyticsVisit.findMany({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        select: {
          createdAt: true,
        },
      }),
prisma.analyticsVisit.groupBy({
  by: ["referrer"],
  where: {
    path: {
      startsWith: "/book/",
    },
    referrer: {
      not: null,
    },
  },
  _count: {
    referrer: true,
  },
  orderBy: {
    _count: {
      referrer: "desc",
    },
  },
}),
prisma.analyticsVisit.groupBy({
  by: ["path"],
  where: {
    path: {
      startsWith: "/models/",
    },
  },
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
    ]);

    const trafficMap = new Map<string, number>();

    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + i);

      trafficMap.set(
        date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        0
      );
    }

    traffic.forEach((item) => {
      const key = new Date(item.createdAt).toLocaleDateString(
        "en-US",
        {
          weekday: "short",
        }
      );

      trafficMap.set(
        key,
        (trafficMap.get(key) ?? 0) + 1
      );
    });

    const trafficData = Array.from(
      trafficMap.entries()
    ).map(([date, views]) => ({
      date,
      views,
    }));
    const growthRate =
  yesterdayVisits === 0
    ? 100
    : Number(
        (
          ((todayVisits - yesterdayVisits) /
            yesterdayVisits) *
          100
        ).toFixed(1)
      );
const browserMap = new Map<string, number>();

topBrowsers.forEach((item) => {
  const browser =
    item.browser
      ?.replace(/\s+\d+(\.\d+)*/g, "")
      .trim() || "Unknown";

  browserMap.set(
    browser,
    (browserMap.get(browser) ?? 0) +
      item._count.browser
  );
});

const normalizedBrowsers = Array.from(
  browserMap.entries()
)
  .map(([browser, count]) => ({
    browser,
    _count: {
      browser: count,
    },
  }))
  .sort(
    (a, b) =>
      b._count.browser -
      a._count.browser
  );
  const normalizedCountries = [...topCountries].sort((a, b) => {
  const lowPriority = [
    "",
    null,
    "Unknown",
    "Local Development",
  ];

  const aLow = lowPriority.includes(a.country as never);
  const bLow = lowPriority.includes(b.country as never);

  if (aLow !== bLow) {
    return aLow ? 1 : -1;
  }

  return b._count.country - a._count.country;
});
const normalizedBookingPlatforms = bookingPlatforms.filter(
  (item) =>
    [
      "WhatsApp",
      "Telegram",
      "LINE",
      "WeChat",
      "Signal",
    ].includes(item.referrer ?? "")
);
    return NextResponse.json({
      success: true,
      data: {
  totalVisits,
  todayVisits,
  yesterdayVisits,
  weekVisits,
  monthVisits,
  growthRate,
        uniqueVisitors: uniqueVisitors.length,
        onlineVisitors: onlineVisitors.length,
        topPages,
        recentVisitors,
        topCountries: normalizedCountries,
        topBrowsers: normalizedBrowsers,
        topDevices,
        topReferrers,
        traffic: trafficData,
        bookingPlatforms: normalizedBookingPlatforms,
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