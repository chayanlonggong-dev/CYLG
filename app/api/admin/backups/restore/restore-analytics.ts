import { prisma } from "@/lib/prisma";

export async function restoreAnalytics(
  analytics: any[]
) {
  if (!Array.isArray(analytics)) {
    return {
      success: false,
      message: "Invalid Analytics data.",
    };
  }

  try {
    await prisma.analyticsVisit.deleteMany();

    if (analytics.length === 0) {
      return {
        success: true,
        restored: 0,
      };
    }

    await prisma.analyticsVisit.createMany({
      data: analytics.map((visit) => ({
        path: visit.path,
        visitorId: visit.visitorId,

        ip: visit.ip ?? null,
        userAgent: visit.userAgent ?? null,
        referrer: visit.referrer ?? null,
        country: visit.country ?? null,
        device: visit.device ?? null,
        browser: visit.browser ?? null,

        createdAt: visit.createdAt
          ? new Date(visit.createdAt)
          : new Date(),
      })),
    });

    return {
      success: true,
      restored: analytics.length,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Failed to restore Analytics.",
    };
  }
}