"use client";

import { useEffect, useState } from "react";

import AnalyticsCards from "@/components/admin/analytics/AnalyticsCards";
import TopPagesCard from "@/components/admin/analytics/TopPagesCard";
import RecentVisitorsCard from "@/components/admin/analytics/RecentVisitorsCard";
import TopCountriesCard from "@/components/admin/analytics/TopCountriesCard";
import TopBrowsersCard from "@/components/admin/analytics/TopBrowsersCard";
import TopDevicesCard from "@/components/admin/analytics/TopDevicesCard";
import TopReferrersCard from "@/components/admin/analytics/TopReferrersCard";
import BookingPlatformsCard from "@/components/admin/analytics/BookingPlatformsCard";
import TrafficChart from "@/components/admin/analytics/TrafficChart";

type TopPage = {
  path: string;
  _count: {
    path: number;
  };
};

type RecentVisitor = {
  createdAt: string;
  path: string;
  country: string | null;
  browser: string | null;
  device: string | null;
};

type Country = {
  country: string | null;
  _count: {
    country: number;
  };
};

type Browser = {
  browser: string | null;
  _count: {
    browser: number;
  };
};

type Device = {
  device: string | null;
  _count: {
    device: number;
  };
};

type Referrer = {
  referrer: string | null;
  _count: {
    referrer: number;
  };
};

type Traffic = {
  date: string;
  views: number;
};

type AnalyticsData = {
  yesterdayVisits: number;
  weekVisits: number;
  monthVisits: number;
  growthRate: number;

  todayVisits: number;
  totalVisits: number;
  uniqueVisitors: number;
  onlineVisitors: number;

  topPages: TopPage[];
  recentVisitors: RecentVisitor[];

  topCountries: Country[];
  topBrowsers: Browser[];
  topDevices: Device[];
  topReferrers: Referrer[];

  traffic: Traffic[];

  bookingPlatforms: {
    referrer: string | null;
    _count: {
      referrer: number;
    };
  }[];
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    todayVisits: 0,
    totalVisits: 0,
    uniqueVisitors: 0,
    onlineVisitors: 0,

    yesterdayVisits: 0,
    weekVisits: 0,
    monthVisits: 0,
    growthRate: 0,

    topPages: [],
    recentVisitors: [],

    topCountries: [],
    topBrowsers: [],
    topDevices: [],
    topReferrers: [],

    traffic: [],

    bookingPlatforms: [],
  });

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await fetch("/api/admin/analytics");
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadAnalytics();
  }, []);  return (
    <main className="min-h-screen bg-[#050505] px-10 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="uppercase tracking-[0.4em] text-yellow-500">
          CYLG CMS
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Analytics
        </h1>

        <p className="mt-4 text-gray-400">
          Website Traffic & Visitor Analytics
        </p>

        <AnalyticsCards
          todayPageViews={data.todayVisits}
          yesterdayPageViews={data.yesterdayVisits}
          weekPageViews={data.weekVisits}
          monthPageViews={data.monthVisits}
          totalPageViews={data.totalVisits}
          uniqueVisitors={data.uniqueVisitors}
          onlineVisitors={data.onlineVisitors}
          growthRate={data.growthRate}
        />

        <div className="mt-8">
          <TrafficChart data={data.traffic} />
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-2">
          <TopPagesCard pages={data.topPages} />
          <RecentVisitorsCard visitors={data.recentVisitors} />
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-2">
          <TopCountriesCard countries={data.topCountries} />
          <TopBrowsersCard browsers={data.topBrowsers} />
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-2">
          <TopDevicesCard devices={data.topDevices} />
          <TopReferrersCard referrers={data.topReferrers} />
        </div>

        <div className="mt-8">
          <BookingPlatformsCard
            bookingPlatforms={data.bookingPlatforms}
          />
        </div>
      </div>
    </main>
  );
}