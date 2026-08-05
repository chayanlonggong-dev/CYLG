import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const visits = await prisma.analyticsVisit.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
        path: true,
        country: true,
        browser: true,
        device: true,
        referrer: true,
        ip: true,
        visitorId: true,
      },
    });

    const header = [
      "Date",
      "Path",
      "Country",
      "Browser",
      "Device",
      "Referrer",
      "IP",
      "Visitor ID",
    ];

    const rows = visits.map((visit) => [
      visit.createdAt.toISOString(),
      visit.path,
      visit.country ?? "",
      visit.browser ?? "",
      visit.device ?? "",
      visit.referrer ?? "",
      visit.ip ?? "",
      visit.visitorId,
    ]);

    const csv = [
      header.join(","),
      ...rows.map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="analytics-${new Date()
          .toISOString()
          .slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to export analytics.",
      },
      {
        status: 500,
      }
    );
  }
}