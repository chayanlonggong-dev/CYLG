"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

const SESSION_TIMEOUT = 30 * 60 * 1000;
const WARNING_TIME = 60 * 1000;
const ACTIVITY_PING_INTERVAL = 60 * 1000;
const SESSION_CHECK_INTERVAL = 60 * 1000;

export default function SessionManager() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const checkRef = useRef<NodeJS.Timeout | null>(null);
  const lastPingRef = useRef(0);

  const [showWarning, setShowWarning] = useState(false);

  async function logout(expired = false) {
    try {
      localStorage.setItem(
        "cylg_logout",
        Date.now().toString()
      );

      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {}

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

    if (
      now - lastPingRef.current <
      ACTIVITY_PING_INTERVAL
    ) {
      return;
    }

    lastPingRef.current = now;

    try {
      await fetch("/api/admin/session/activity", {
        method: "POST",
        credentials: "include",
      });
    } catch {}
  }

  async function checkSession() {
    try {
      const res = await fetch(
        "/api/admin/session/check",
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!res.ok) {
        logout(true);
      }
    } catch {}
  }

  function resetTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    setShowWarning(false);

    pingActivity();

    warningRef.current = setTimeout(() => {
      setShowWarning(true);
    }, SESSION_TIMEOUT - WARNING_TIME);

    timerRef.current = setTimeout(() => {
      logout(true);
    }, SESSION_TIMEOUT);
  }

  useEffect(() => {
    resetTimer();

    checkRef.current = setInterval(() => {
      checkSession();
    }, SESSION_CHECK_INTERVAL);

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer, {
        passive: true,
      });
    });

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "cylg_logout") {
        logout();
      }
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      events.forEach((event) => {
        window.removeEventListener(
          event,
          resetTimer
        );
      });

      window.removeEventListener(
        "storage",
        handleStorage
      );

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }

      if (checkRef.current) {
        clearInterval(checkRef.current);
      }
    };
  }, []);

  if (!showWarning) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] w-[360px] rounded-2xl border border-yellow-500 bg-[#111111] p-5 shadow-2xl">
      <h3 className="text-lg font-bold text-yellow-400">
        Session Expiring
      </h3>

      <p className="mt-3 text-sm leading-7 text-gray-300">
        Your session will expire in 1 minute due to inactivity.
      </p>

      <div className="mt-5 flex gap-3">
        <button
          onClick={resetTimer}
          className="flex-1 rounded-xl bg-yellow-500 py-3 font-bold text-black transition hover:bg-yellow-400"
        >
          Continue
        </button>

        <button
          onClick={() => logout()}
          className="flex-1 rounded-xl border border-yellow-500 py-3 font-bold text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
        >
          Logout
        </button>
      </div>
    </div>
  );
}