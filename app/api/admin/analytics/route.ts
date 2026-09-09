import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth/session";
import { apiUnauthorized } from "@/lib/api/response";
import {
  isPublicRealHuman,
  isUnitedStates,
  isContactClickPath,
  isModelPath,
  extractModelCode,
  extractCollection,
  classifyTrafficQuality,
} from "@/lib/analytics/filters";
import { classifyTrafficSource } from "@/lib/analytics/trafficSource";

/** Asia/Bangkok (UTC+7) day boundaries */
function getBangkokDayBounds(base = new Date()) {
  const offsetMs = 7 * 60 * 60 * 1000;
  const bangkokNow = new Date(base.getTime() + offsetMs);
  const y = bangkokNow.getUTCFullYear();
  const m = bangkokNow.getUTCMonth();
  const d = bangkokNow.getUTCDate();

  const startUtc = Date.UTC(y, m, d) - offsetMs;
  const endUtc = startUtc + 24 * 60 * 60 * 1000;

  return {
    start: new Date(startUtc),
    end: new Date(endUtc),
    bangkokDate: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
  };
}

function getRange(range: string, customFrom?: string, customTo?: string) {
  const now = new Date();
  const today = getBangkokDayBounds(now);

  if (range === "yesterday") {
    const y = getBangkokDayBounds(new Date(today.start.getTime() - 1));
    return { start: y.start, end: y.end, label: "Yesterday" };
  }

  if (range === "last7") {
    const start = new Date(today.start.getTime() - 6 * 24 * 60 * 60 * 1000);
    return { start, end: today.end, label: "Last 7 Days" };
  }

  if (range === "last30") {
    const start = new Date(today.start.getTime() - 29 * 24 * 60 * 60 * 1000);
    return { start, end: today.end, label: "Last 30 Days" };
  }

  if (range === "thisMonth") {
    const offsetMs = 7 * 60 * 60 * 1000;
    const bangkokNow = new Date(now.getTime() + offsetMs);
    const y = bangkokNow.getUTCFullYear();
    const m = bangkokNow.getUTCMonth();
    const startUtc = Date.UTC(y, m, 1) - offsetMs;
    return {
      start: new Date(startUtc),
      end: today.end,
      label: "This Month",
    };
  }

  if (range === "lastMonth") {
    const offsetMs = 7 * 60 * 60 * 1000;
    const bangkokNow = new Date(now.getTime() + offsetMs);
    const y = bangkokNow.getUTCFullYear();
    const m = bangkokNow.getUTCMonth();
    const startUtc = Date.UTC(y, m - 1, 1) - offsetMs;
    const endUtc = Date.UTC(y, m, 1) - offsetMs;
    return {
      start: new Date(startUtc),
      end: new Date(endUtc),
      label: "Last Month",
    };
  }

  if (range === "custom" && customFrom && customTo) {
    const offsetMs = 7 * 60 * 60 * 1000;
    const fromParts = customFrom.split("-").map(Number);
    const toParts = customTo.split("-").map(Number);
    const startUtc =
      Date.UTC(fromParts[0], fromParts[1] - 1, fromParts[2]) - offsetMs;
    const endUtc =
      Date.UTC(toParts[0], toParts[1] - 1, toParts[2]) -
      offsetMs +
      24 * 60 * 60 * 1000;
    return {
      start: new Date(startUtc),
      end: new Date(endUtc),
      label: "Custom Range",
    };
  }

  return { start: today.start, end: today.end, label: "Today" };
}

type VisitRow = {
  id: number;
  path: string;
  visitorId: string;
  ip: string | null;
  userAgent: string | null;
  referrer: string | null;
  country: string | null;
  device: string | null;
  browser: string | null;
  createdAt: Date;
};

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return apiUnauthorized("Unauthorized.", "UNAUTHORIZED");
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "today";
    const customFrom = searchParams.get("from") || undefined;
    const customTo = searchParams.get("to") || undefined;

    const { start, end, label } = getRange(range, customFrom, customTo);
    const onlineSince = new Date(Date.now() - 5 * 60 * 1000);

    const [rangeVisits, recentVisits] = await Promise.all([
      prisma.analyticsVisit.findMany({
        where: {
          createdAt: { gte: start, lt: end },
        },
        select: {
          id: true,
          path: true,
          visitorId: true,
          ip: true,
          userAgent: true,
          referrer: true,
          country: true,
          device: true,
          browser: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.analyticsVisit.findMany({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
        select: {
          id: true,
          path: true,
          visitorId: true,
          ip: true,
          userAgent: true,
          referrer: true,
          country: true,
          device: true,
          browser: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
    ]);

    const publicVisits = (rangeVisits as VisitRow[]).filter(isPublicRealHuman);
    const usVisits = publicVisits.filter((v) => isUnitedStates(v.country));

    let realHuman = 0;
    let bot = 0;
    let admin = 0;
    let development = 0;
    let suspicious = 0;
    for (const v of rangeVisits as VisitRow[]) {
      const q = classifyTrafficQuality(v);
      if (q === "real_human") realHuman++;
      else if (q === "bot") bot++;
      else if (q === "admin") admin++;
      else if (q === "development") development++;
      else suspicious++;
    }

    function uniqueVisitors(rows: VisitRow[]): Set<string> {
      return new Set(rows.map((r) => r.visitorId).filter(Boolean));
    }

    function countSessions(rows: VisitRow[]): number {
      const byVisitor = new Map<string, Date[]>();
      for (const r of rows) {
        if (!r.visitorId) continue;
        const list = byVisitor.get(r.visitorId) || [];
        list.push(new Date(r.createdAt));
        byVisitor.set(r.visitorId, list);
      }
      let sessions = 0;
      const TIMEOUT = 30 * 60 * 1000;
      for (const times of byVisitor.values()) {
        times.sort((a, b) => a.getTime() - b.getTime());
        let last = 0;
        for (const t of times) {
          if (last === 0 || t.getTime() - last > TIMEOUT) {
            sessions++;
          }
          last = t.getTime();
        }
      }
      return sessions;
    }

    function engagedVisitorIds(rows: VisitRow[]): Set<string> {
      const pageCount = new Map<string, number>();
      const engaged = new Set<string>();
      for (const r of rows) {
        if (!r.visitorId) continue;
        pageCount.set(r.visitorId, (pageCount.get(r.visitorId) || 0) + 1);
        if (isModelPath(r.path) || isContactClickPath(r.path)) {
          engaged.add(r.visitorId);
        }
      }
      for (const [vid, count] of pageCount) {
        if (count >= 2) engaged.add(vid);
      }
      return engaged;
    }

    function modelViewerIds(rows: VisitRow[]): Set<string> {
      const s = new Set<string>();
      for (const r of rows) {
        if (r.visitorId && isModelPath(r.path)) s.add(r.visitorId);
      }
      return s;
    }

    function contactClickerIds(rows: VisitRow[]): Set<string> {
      const s = new Set<string>();
      for (const r of rows) {
        if (r.visitorId && isContactClickPath(r.path)) s.add(r.visitorId);
      }
      return s;
    }

    function potentialLeadIds(rows: VisitRow[]): Set<string> {
      return contactClickerIds(rows);
    }

    const confirmedBookings = 0;

    const realVisitorSet = uniqueVisitors(publicVisits);
    const usVisitorSet = uniqueVisitors(usVisits);
    const otherVisitorSet = new Set(
      [...realVisitorSet].filter((id) => !usVisitorSet.has(id))
    );

    const usEngaged = engagedVisitorIds(usVisits);
    const usModelViewers = modelViewerIds(usVisits);
    const usContactClickers = contactClickerIds(usVisits);
    const usPotentialLeads = potentialLeadIds(usVisits);

    const allEngaged = engagedVisitorIds(publicVisits);
    const allModelViewers = modelViewerIds(publicVisits);
    const allContactClickers = contactClickerIds(publicVisits);
    const allPotentialLeads = potentialLeadIds(publicVisits);

    const contactPlatforms: Record<string, number> = {
      whatsapp: 0,
      telegram: 0,
      signal: 0,
      line: 0,
      wechat: 0,
    };
    let totalContactClicks = 0;
    for (const r of publicVisits) {
      if (isContactClickPath(r.path)) {
        totalContactClicks++;
        const platform = (r.referrer || "").toLowerCase();
        if (platform in contactPlatforms) {
          contactPlatforms[platform]++;
        } else {
          const parts = r.path.split("/");
          const p = (parts[2] || "").toLowerCase();
          if (p in contactPlatforms) contactPlatforms[p]++;
        }
      }
    }

    let usContactClicks = 0;
    for (const r of usVisits) {
      if (isContactClickPath(r.path)) usContactClicks++;
    }

    const onlineRows = (recentVisits as VisitRow[]).filter(
      (v) => new Date(v.createdAt) >= onlineSince && isPublicRealHuman(v)
    );
    const onlineVisitors = uniqueVisitors(onlineRows).size;

    function sourceStats(rows: VisitRow[]) {
      const map = new Map<
        string,
        {
          visitors: Set<string>;
          pageViews: number;
          modelViews: number;
          contactClicks: number;
          potentialLeads: Set<string>;
        }
      >();

      for (const r of rows) {
        const classified = classifyTrafficSource({ referrer: r.referrer, userAgent: r.userAgent });
        const key = classified.source;
        if (!map.has(key)) {
          map.set(key, {
            visitors: new Set(),
            pageViews: 0,
            modelViews: 0,
            contactClicks: 0,
            potentialLeads: new Set(),
          });
        }
        const entry = map.get(key)!;
        if (r.visitorId) entry.visitors.add(r.visitorId);
        entry.pageViews++;
        if (isModelPath(r.path)) entry.modelViews++;
        if (isContactClickPath(r.path)) {
          entry.contactClicks++;
          if (r.visitorId) entry.potentialLeads.add(r.visitorId);
        }
      }

      return Array.from(map.entries())
        .map(([source, e]) => {
          const classified = classifyTrafficSource({ referrer: source });
          return {
            source,
            category: classified.category,
            visitors: e.visitors.size,
            pageViews: e.pageViews,
            modelViews: e.modelViews,
            contactClicks: e.contactClicks,
            potentialLeads: e.potentialLeads.size,
          };
        })
        .sort((a, b) => b.visitors - a.visitors);
    }

    const trafficSources = sourceStats(publicVisits);
    const usTrafficSources = sourceStats(usVisits);

    const modelStats = new Map<
      string,
      {
        views: number;
        visitors: Set<string>;
        usVisitors: Set<string>;
        contactClicks: number;
      }
    >();
    for (const r of publicVisits) {
      const code = extractModelCode(r.path);
      if (!code || code === "unknown") continue;
      if (!modelStats.has(code)) {
        modelStats.set(code, {
          views: 0,
          visitors: new Set(),
          usVisitors: new Set(),
          contactClicks: 0,
        });
      }
      const m = modelStats.get(code)!;
      if (isModelPath(r.path) || isContactClickPath(r.path)) {
        m.views++;
        if (r.visitorId) {
          m.visitors.add(r.visitorId);
          if (isUnitedStates(r.country)) m.usVisitors.add(r.visitorId);
        }
      }
      if (isContactClickPath(r.path)) m.contactClicks++;
    }
    const topModels = Array.from(modelStats.entries())
      .map(([model, s]) => ({
        model,
        views: s.views,
        uniqueVisitors: s.visitors.size,
        usVisitors: s.usVisitors.size,
        contactClicks: s.contactClicks,
      }))
      .sort((a, b) => b.usVisitors - a.usVisitors || b.views - a.views)
      .slice(0, 15);

    const collectionStats = new Map<
      string,
      {
        visitors: Set<string>;
        usVisitors: Set<string>;
        views: number;
        contactClicks: number;
      }
    >();
    for (const r of publicVisits) {
      const col = extractCollection(r.path);
      if (!col) continue;
      if (!collectionStats.has(col)) {
        collectionStats.set(col, {
          visitors: new Set(),
          usVisitors: new Set(),
          views: 0,
          contactClicks: 0,
        });
      }
      const c = collectionStats.get(col)!;
      c.views++;
      if (r.visitorId) {
        c.visitors.add(r.visitorId);
        if (isUnitedStates(r.country)) c.usVisitors.add(r.visitorId);
      }
      if (isContactClickPath(r.path)) c.contactClicks++;
    }
    const topCollections = Array.from(collectionStats.entries())
      .map(([collection, s]) => ({
        collection,
        visitors: s.visitors.size,
        usVisitors: s.usVisitors.size,
        views: s.views,
        contactClicks: s.contactClicks,
      }))
      .sort((a, b) => b.usVisitors - a.usVisitors || b.views - a.views)
      .slice(0, 10);

    const usPageCounts = new Map<string, number>();
    for (const r of usVisits) {
      if (!r.visitorId) continue;
      usPageCounts.set(r.visitorId, (usPageCounts.get(r.visitorId) || 0) + 1);
    }
    let us2Plus = 0;
    let us3Plus = 0;
    for (const count of usPageCounts.values()) {
      if (count >= 2) us2Plus++;
      if (count >= 3) us3Plus++;
    }

        const recentUsRaw = (recentVisits as VisitRow[])
      .filter((v) => isPublicRealHuman(v))
      .slice(0, 200);

    const usSessionMap = new Map<
      string,
      {
        visitorId: string;
        country: string;
        device: string;
        browser: string;
        source: string;
        pages: string[];
        firstAt: Date;
        lastAt: Date;
        contact: string | null;
      }
    >();

    for (const r of recentUsRaw.slice().reverse()) {
      const key = r.visitorId;
      const existing = usSessionMap.get(key);
      const t = new Date(r.createdAt);
      if (!existing) {
        usSessionMap.set(key, {
          visitorId: key.slice(0, 8) + "…",
          country: r.country || "United States",
          device: r.device || "Unknown",
          browser: r.browser || "Unknown",
          source: isContactClickPath(r.path)
            ? "Direct"
            : classifyTrafficSource({
                referrer: r.referrer,
                userAgent: r.userAgent,
              }).source,
          pages: [r.path],
          firstAt: t,
          lastAt: t,
          contact: isContactClickPath(r.path)
            ? r.referrer || r.path.split("/")[2] || null
            : null,
        });
      } else {
        existing.pages.push(r.path);
        existing.lastAt = t;
        if (isContactClickPath(r.path)) {
          existing.contact =
            r.referrer || r.path.split("/")[2] || existing.contact;
        }
        if (
          !isContactClickPath(r.path) &&
          existing.source === "Direct" &&
          r.referrer
        ) {
          existing.source = classifyTrafficSource({
            referrer: r.referrer,
            userAgent: r.userAgent,
          }).source;
        }
      }
    }

    const recentUsVisitors = Array.from(usSessionMap.values())
      .sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime())
      .slice(0, 20)
      .map((s) => ({
        visitorId: s.visitorId,
        country: s.country,
        time: s.lastAt.toISOString(),
        device: s.device,
        browser: s.browser,
        source: s.source,
        pages: s.pages.filter((p) => !isContactClickPath(p)).slice(0, 8),
        durationSeconds: Math.max(
          0,
          Math.round((s.lastAt.getTime() - s.firstAt.getTime()) / 1000)
        ),
        contact: s.contact,
      }));

    function groupCount(
      rows: VisitRow[],
      field: "country" | "browser" | "device"
    ) {
      const map = new Map<string, number>();
      for (const r of rows) {
        let key = (r[field] as string) || "Unknown";
        if (field === "country" && isUnitedStates(key)) {
          key = "United States";
        }
        if (field === "browser") {
          if (
            ![
              "Chrome",
              "Edge",
              "Safari",
              "Firefox",
              "Opera",
              "Brave",
              "Samsung Internet",
              "DuckDuckGo",
              "Arc",
            ].includes(key)
          ) {
            if (key !== "Unknown") key = "Other";
          }
        }
        if (field === "device") {
          if (!["Desktop", "Mobile", "Tablet"].includes(key)) key = "Unknown";
        }
        map.set(key, (map.get(key) || 0) + 1);
      }
      return Array.from(map.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 12);
    }

    const chartStart = new Date(
      getBangkokDayBounds().start.getTime() - 6 * 24 * 60 * 60 * 1000
    );
    const trafficChart: { date: string; views: number; usViews: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(chartStart.getTime() + i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const dayRows = publicVisits.filter((v) => {
        const t = new Date(v.createdAt).getTime();
        return t >= dayStart.getTime() && t < dayEnd.getTime();
      });
      const usDay = dayRows.filter((v) => isUnitedStates(v.country));
      const labelDate = new Date(dayStart.getTime() + 7 * 60 * 60 * 1000);
      trafficChart.push({
        date: labelDate.toISOString().slice(0, 10),
        views: dayRows.length,
        usViews: usDay.length,
      });
    }

    const avgPagesPerUsVisitor =
      usVisitorSet.size === 0
        ? 0
        : Number((usVisits.length / usVisitorSet.size).toFixed(2));

    return NextResponse.json({
      success: true,
      data: {
        range: label,
        timezone: "Asia/Bangkok",
        overview: {
          realVisitors: realVisitorSet.size,
          usVisitors: usVisitorSet.size,
          otherVisitors: otherVisitorSet.size,
          pageViews: publicVisits.length,
          currentlyOnline: onlineVisitors,
          contactClicks: totalContactClicks,
          potentialLeads: allPotentialLeads.size,
          confirmedBookings,
        },
        usTraffic: {
          visitors: usVisitorSet.size,
          sessions: countSessions(usVisits),
          pageViews: usVisits.length,
          avgPagesPerVisitor: avgPagesPerUsVisitor,
          engagedVisitors: usEngaged.size,
          modelViewers: usModelViewers.size,
          contactClicks: usContactClicks,
          potentialLeads: usPotentialLeads.size,
          confirmedBookings: 0,
        },
        trafficQuality: {
          realHumanVisitors: realVisitorSet.size,
          realHumanPageViews: realHuman,
          botCrawler: bot,
          adminTraffic: admin,
          developmentTraffic: development,
          suspiciousTraffic: suspicious,
        },
        usVisitorQuality: {
          usVisitors: usVisitorSet.size,
          visitorsWith2PlusPages: us2Plus,
          visitorsWith3PlusPages: us3Plus,
          modelPageViewers: usModelViewers.size,
          contactClickers: usContactClickers.size,
          potentialLeads: usPotentialLeads.size,
          confirmedBookings: 0,
        },
        customerFunnel: {
          visitors: realVisitorSet.size,
          engagedVisitors: allEngaged.size,
          modelViewers: allModelViewers.size,
          contactClicks: allContactClickers.size,
          potentialLeads: allPotentialLeads.size,
          confirmedBookings: 0,
        },
        usCustomerFunnel: {
          usVisitors: usVisitorSet.size,
          usEngagedVisitors: usEngaged.size,
          usModelViewers: usModelViewers.size,
          usContactClicks: usContactClickers.size,
          usPotentialLeads: usPotentialLeads.size,
          usConfirmedBookings: 0,
        },
        contactActivity: {
          platforms: contactPlatforms,
          total: totalContactClicks,
        },
        trafficSources,
        usTrafficSources,
        topModels,
        topCollections,
        recentUsVisitors,
        countries: groupCount(publicVisits, "country"),
        browsers: groupCount(publicVisits, "browser"),
        devices: groupCount(publicVisits, "device"),
        trafficChart,
      },
    });
  } catch (error) {
    console.error("[admin/analytics]", error);
    return NextResponse.json(
      { success: false, message: "Failed to load analytics." },
      { status: 500 }
    );
  }
}