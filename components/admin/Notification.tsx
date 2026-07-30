"use client";

import { useEffect, useState } from "react";

import type { NotificationOptions, NotificationType } from "./NotificationProvider";

function getToneClasses(type: NotificationType) {
  switch (type) {
    case "success":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-200";
    case "error":
      return "border-red-500/40 bg-red-500/10 text-red-200";
    case "warning":
      return "border-amber-500/40 bg-amber-500/10 text-amber-200";
    case "info":
    default:
      return "border-sky-500/40 bg-sky-500/10 text-sky-200";
  }
}

function getIcon(type: NotificationType) {
  switch (type) {
    case "success":
      return "✓";
    case "error":
      return "✕";
    case "warning":
      return "!";
    case "info":
    default:
      return "i";
  }
}

export default function Notification({
  notification,
  onClose,
}: {
  notification: NotificationOptions & { id: number };
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const enterTimer = window.setTimeout(() => setVisible(true), 10);
    const timeout = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(onClose, 180);
    }, notification.duration ?? 5000);

    return () => {
      window.clearTimeout(enterTimer);
      window.clearTimeout(timeout);
    };
  }, [notification.duration, onClose]);

  return (
    <div
      className={`pointer-events-auto rounded-2xl border p-4 shadow-2xl backdrop-blur-sm transition-all duration-300 ${getToneClasses(notification.type)} ${visible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-sm font-semibold">
            {getIcon(notification.type)}
          </div>
          <div>
            <p className="font-semibold">{notification.title}</p>
            {notification.message ? (
              <p className="mt-1 text-sm text-white/75">{notification.message}</p>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            window.setTimeout(onClose, 180);
          }}
          className="rounded-full px-2 py-1 text-sm text-white/70 transition hover:bg-black/20 hover:text-white"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}
