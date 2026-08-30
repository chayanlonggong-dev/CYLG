"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { LEVELS } from "@/app/data/options";

import DashboardStats from "@/components/admin/DashboardStats";
import ActivityChart from "@/components/admin/ActivityChart";
import RecentModels from "@/components/admin/RecentModels";
import RecentActivity from "@/components/admin/RecentActivity";
import QuickActions from "@/components/admin/QuickActions";
import { adminFetch } from "@/lib/admin/adminFetch";

type ModelSummary = {
  id: number;
  code: string;
  title: string;
  avatar: string;
  city: string;
  nationality: string;
  level: string;
  online: boolean;
  featured: boolean;
  createdAt?: string;
};

type ActivityItem = {
  id: number;
  title: string;
  description: string;
  time: string;
  type: "create" | "update" | "delete" | "system";
};

export default function DashboardPage() {
  const [models, setModels] = useState<ModelSummary[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadModels() {
      try {
        const response = await fetch("/api/models");
        const payload = await response.json();
        const data = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];
        setModels(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setModels([]);
      } finally {
        setLoading(false);
      }
    }

    async function loadActivities() {
      try {
        const response = await fetch("/api/admin/logs");
        const payload = await response.json();
        const data = Array.isArray(payload?.data) ? payload.data : [];

        setActivities(
          data.slice(0, 8).map(
            (
              log: {
                id: string;
                action: string;
                description: string;
                createdAt: string;
              },
              index: number
            ) => ({
              id: index,
              title: log.action,
              description: log.description,
              time: new Date(log.createdAt).toLocaleString(),
              type: log.action.includes("DELETE")
                ? "delete"
                : log.action.includes("UPDATE") ||
                    log.action.includes("EDIT")
                  ? "update"
                  : log.action.includes("CREATE")
                    ? "create"
                    : "system",
            })
          )
        );
      } catch (error) {
        console.error(error);
        setActivities([]);
      }
    }

    async function initialize() {
      await loadModels();
      await loadActivities();
    }

    initialize();
  }, []);

  const stats = useMemo(() => {
    const levelCounts = LEVELS.reduce<Record<string, number>>((acc, level) => {
      acc[level] = 0;
      return acc;
    }, {});

    models.forEach((model) => {
      if (model.level in levelCounts) {
        levelCounts[model.level] += 1;
      }
    });

    return {
      totalModels: models.length,
      crownCount: levelCounts.CROWN ?? 0,
      sssCount: levelCounts.SSS ?? 0,
      ssCount: levelCounts.SS ?? 0,
      sCount: levelCounts.S ?? 0,
      aCount: levelCounts.A ?? 0,
      onlineModels: models.filter((model) => model.online).length,
      offlineModels: models.filter((model) => !model.online).length,
      featuredModels: models.filter((model) => model.featured).length,
    };
  }, [models]);

  const recentModels = useMemo(() => {
    return models.slice(0, 8);
  }, [models]);

  async function logout() {
    try {
      await adminFetch("/api/admin/logout", {
        method: "POST",
      });
    } catch {
      // 即使網路失敗也清前端並導向登入
    }

    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("/admin/login");
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-yellow-500/20 bg-[#101010]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
              CYLG ADMIN
            </p>
            <h1 className="mt-2 text-3xl font-black">Dashboard</h1>
          </div>

          <button
            onClick={logout}
            className="rounded-full border border-yellow-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-yellow-500 transition hover:bg-yellow-500 hover:text-black"
          >
            LOGOUT
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-8 py-12">
        <DashboardStats
          loading={loading}
          totalModels={stats.totalModels}
          crownCount={stats.crownCount}
          sssCount={stats.sssCount}
          ssCount={stats.ssCount}
          sCount={stats.sCount}
          aCount={stats.aCount}
          onlineModels={stats.onlineModels}
          offlineModels={stats.offlineModels}
        />
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-8 pb-8 lg:grid-cols-2">
        <ActivityChart
          totalModels={stats.totalModels}
          onlineModels={stats.onlineModels}
          featuredModels={stats.featuredModels}
        />
        <QuickActions />
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-8 pb-16 lg:grid-cols-2">
        <RecentModels loading={loading} models={recentModels} />
        <RecentActivity loading={loading} activities={activities} />
      </section>
    </main>
  );
}