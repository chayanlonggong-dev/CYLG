"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function getVisitorId(): string {
  const key = "cylg_visitor_id";

  let id = localStorage.getItem(key);

  if (!id) {
    id =
      crypto.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    localStorage.setItem(key, id);
  }

  return id;
}

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    async function track() {
      try {
        const visitorId = getVisitorId();

        await fetch("/api/analytics/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: pathname,
            visitorId,
          }),
        });
      } catch (error) {
        console.error("Analytics Track Error:", error);
      }
    }

    if (pathname) {
      track();
    }
  }, [pathname]);

  return null;
}