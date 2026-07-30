"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import Notification from "./Notification";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface NotificationOptions {
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationItem extends NotificationOptions {
  id: number;
}

interface NotificationContextValue {
  addNotification: (options: NotificationOptions) => void;
  removeNotification: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

function NotificationCard({
  notification,
  onClose,
}: {
  notification: NotificationItem;
  onClose: () => void;
}) {
  return <Notification notification={notification} onClose={onClose} />;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const removeNotification = useCallback((id: number) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  const addNotification = useCallback((options: NotificationOptions) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setNotifications((current) => [...current, { ...options, id }]);
  }, []);

  const value = useMemo(
    () => ({ addNotification, removeNotification }),
    [addNotification, removeNotification]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-220 flex w-[min(24rem,calc(100%-2rem))] flex-col gap-3">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }

  return context;
}

export default NotificationProvider;
