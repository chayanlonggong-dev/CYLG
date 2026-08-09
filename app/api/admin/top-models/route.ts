import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { getAdminSession } from "@/lib/auth/session";
import { apiUnauthorized } from "@/lib/api/response";

const LEVEL_ORDER: Record<string, number> = {
  CROWN: 0,
  SSS: 1,
  SS: 2,
  S: 3,
  A: 4,
};

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return apiUnauthorized(
        "Unauthorized.",
        "UNAUTHORIZED"
      );
    }

    const { searchParams } =
      new URL(request.url);

    const period =
      searchParams.get("period") ?? "all";

    const now = new Date();

    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const yesterday = new Date(today);
    yesterday.setDate(
      today.getDate() - 1
    );

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(
      today.getDate() - 6
    );

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(
      today.getDate() - 29
    );

    let createdAtFilter = {};

    switch (period) {
      case "today":
        createdAtFilter = {
          gte: today,
        };
        break;

      case "yesterday":
        createdAtFilter = {
          gte: yesterday,
          lt: today,
        };
        break;

      case "7days":
        createdAtFilter = {
          gte: sevenDaysAgo,
        };
        break;

      case "30days":
        createdAtFilter = {
          gte: thirtyDaysAgo,
        };
        break;

      default:
        createdAtFilter = {};
    }

    const visits =
      await prisma.analyticsVisit.groupBy({
        by: ["path"],
        _count: {
          path: true,
        },
        where: {
          path: {
            startsWith: "/models/",
          },

          ...(Object.keys(
            createdAtFilter
          ).length > 0 && {
            createdAt: createdAtFilter,
          }),
        },
      });

    console.log(visits);

    const visitMap = new Map<
      string,
      number
    >();

    visits.forEach((item) => {
      const code = item.path.replace(
        "/models/",
        ""
      );

      visitMap.set(
        code,
        item._count.path
      );
    });

    const models =
      await prisma.model.findMany({
        select: {
          code: true,
          avatar: true,
          level: true,
          number: true,
        },
      });

    const data = models
      .map((model) => ({
        code: model.code,
        avatar: model.avatar,
        level: model.level,
        number: model.number,
        views:
          visitMap.get(model.code) ?? 0,
      }))
      .sort((a, b) => {
        // Views
        if (b.views !== a.views) {
          return b.views - a.views;
        }

        // Level
        const levelCompare =
          LEVEL_ORDER[a.level] -
          LEVEL_ORDER[b.level];

        if (levelCompare !== 0) {
          return levelCompare;
        }

        // Number
        return a.number - b.number;
      })
      .map(({ number, ...model }) => model);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}