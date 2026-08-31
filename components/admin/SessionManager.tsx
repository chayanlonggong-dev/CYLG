"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { adminFetch } from "@/lib/admin/adminFetch";

const SESSION_TIMEOUT = 10 * 60 * 1000;
const WARNING_TIME = 60 * 1000;
const ACTIVITY_PING_INTERVAL = 60 * 1000;
const SESSION_CHECK_INTERVAL = 60 * 1000;
/** 避免微抖、連續捲動把計時一直重置 */
const ACTIVITY_RESET_THROTTLE = 15 * 1000;

export default function SessionManager() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPingRef = useRef(0);
  const lastActivityRef = useRef(Date.now());
  const lastResetRef = useRef(0);
  const loggingOutRef = useRef(false);

  const [showWarning, setShowWarning] = useState(false);

  async function logout(expired = false) {
    if (loggingOutRef.current) {
      return;
    }
    loggingOutRef.current = true;

    try {
      localStorage.setItem(
        "cylg_logout",
        Date.now().toString()
      );

      await adminFetch("/api/admin/logout", {
        method: "POST",
      });
    } catch {
      // Ignore network errors; still clear client state.
    }

    localStorage.clear();
    sessionStorage.clear();

    if (expired) {
      window.location.replace("/admin/login?expired=1");
    } else {
      window.location.replace("/admin/login");
    }
  }

  async function pingActivity() {
    const now = Date.now();

    if (now - lastPingRef.current < ACTIVITY_PING_INTERVAL) {
      return;
    }

    lastPingRef.current = now;

    try {
      const res = await adminFetch("/api/admin/session/activity", {
        method: "POST",
      });

      if (res.status === 401) {
        await logout(true);
      }
    } catch {
      // Ignore transient network errors.
    }
  }

  async function checkSession() {
    try {
      const res = await adminFetch(
        "/api/admin/session/activity/check",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (res.status === 401) {
        await logout(true);
        return false;
      }

      return res.ok;
    } catch (error) {
      console.error("Session check failed:", error);
      return true;
    }
  }

  function clearTimers() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (warningRef.current) {
      clearTimeout(warningRef.current);
      warningRef.current = null;
    }
  }

  function resetTimer(force = false) {
    const now = Date.now();

    if (
      !force &&
      now - lastResetRef.current < ACTIVITY_RESET_THROTTLE
    ) {
      lastActivityRef.current = now;
      return;
    }

    lastResetRef.current = now;
    lastActivityRef.current = now;
    clearTimers();
    setShowWarning(false);
    pingActivity();

    warningRef.current = setTimeout(() => {
      setShowWarning(true);
    }, SESSION_TIMEOUT - WARNING_TIME);

    timerRef.current = setTimeout(() => {
      logout(true);
    }, SESSION_TIMEOUT);
  }

  function enforceIdleOnResume() {
    const idleMs = Date.now() - lastActivityRef.current;

    if (idleMs >= SESSION_TIMEOUT) {
      logout(true);
      return;
    }

    if (idleMs >= SESSION_TIMEOUT - WARNING_TIME) {
      setShowWarning(true);
    }

    clearTimers();

    const remaining = SESSION_TIMEOUT - idleMs;

    if (remaining <= WARNING_TIME) {
      setShowWarning(true);
      timerRef.current = setTimeout(() => {
        logout(true);
      }, Math.max(remaining, 0));
    } else {
      warningRef.current = setTimeout(() => {
        setShowWarning(true);
      }, remaining - WARNING_TIME);

      timerRef.current = setTimeout(() => {
        logout(true);
      }, remaining);
    }

    checkSession();
  }

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (window.location.pathname === "/admin/login" ||
        window.location.pathname === "/admin")
    ) {
      return;
    }

    resetTimer(true);

    checkRef.current = setInterval(() => {
      if (Date.now() - lastActivityRef.current >= SESSION_TIMEOUT) {
        logout(true);
        return;
      }
      checkSession();
    }, SESSION_CHECK_INTERVAL);

    // 已移除 mousemove
    const events: Array<keyof WindowEventMap> = [
      "mousedown",
      "keydown",
      "click",
      "scroll",
      "touchstart",
      "pointerdown",
    ];

    const onActivity = () => {
      resetTimer(false);
    };

    events.forEach((event) => {
      window.addEventListener(event, onActivity, { passive: true });
    });

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        enforceIdleOnResume();
      }
    };

    const onPageShow = () => {
      enforceIdleOnResume();
    };

    const onFocus = () => {
      enforceIdleOnResume();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("focus", onFocus);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "cylg_logout") {
        logout();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, onActivity);
      });

      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", handleStorage);

      clearTimers();

      if (checkRef.current) {
        clearInterval(checkRef.current);
        checkRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!showWarning) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-9999 w-90 rounded-2xl border border-yellow-500 bg-[#111111] p-5 shadow-2xl">
      <h3 className="text-lg font-bold text-yellow-400">
        Session Expiring
      </h3>

      <p className="mt-3 text-sm leading-7 text-gray-300">
        Your session will expire in 1 minute due to inactivity.
      </p>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={() => resetTimer(true)}
          className="flex-1 rounded-xl bg-yellow-500 py-3 font-bold text-black transition hover:bg-yellow-400"
        >
          Continue
        </button>

        <button
          type="button"
          onClick={() => logout()}
          className="flex-1 rounded-xl border border-yellow-500 py-3 font-bold text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
        >
          Logout
        </button>
      </div>
    </div>
  );
}