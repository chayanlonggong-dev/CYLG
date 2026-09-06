"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const VISITOR_KEY = "cylg_visitor_id";
const ACQ_KEY = "cylg_acq";

function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id =
      crypto.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function getAcquisition() {
  try {
    const saved = sessionStorage.getItem(ACQ_KEY);
    if (saved) return JSON.parse(saved) as { referrer: string; query: string };
  } catch {
    /* ignore */
  }
  const payload = {
    referrer: typeof document !== "undefined" ? document.referrer || "" : "",
    query: typeof window !== "undefined" ? window.location.search || "" : "",
  };
  try {
    sessionStorage.setItem(ACQ_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
  return payload;
}

function shouldSkipTracking(pathname: string | null): boolean {
  if (!pathname) return true;
  const p = pathname.toLowerCase();
  if (p.startsWith("/admin")) return true;
  if (p.startsWith("/api")) return true;
  if (p.startsWith("/_next")) return true;
  if (p === "/favicon.ico") return true;
  if (p === "/robots.txt") return true;
  if (p.startsWith("/sitemap")) return true;
  return false;
}

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    async function track() {
      if (shouldSkipTracking(pathname)) return;

      try {
        const visitorId = getVisitorId();
        const acq = getAcquisition();

        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: pathname,
            visitorId,
            referrer: acq.referrer,
            query: acq.query,
          }),
        });
      } catch (error) {
        console.error("Analytics Track Error:", error);
      }
    }

    if (pathname) void track();
  }, [pathname]);

  return null;
}