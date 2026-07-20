export type NotificationType =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ERROR"
  | "BOOKING"
  | "CONTACT";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  userId?: string;
}

const notifications: Notification[] = [];

function generateId() {
  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .slice(2, 10)
  );
}

export function createNotification(
  data: Omit<
    Notification,
    "id" | "read" | "createdAt"
  >
) {
  const notification: Notification = {
    id: generateId(),
    read: false,
    createdAt: new Date(),
    ...data,
  };

  notifications.unshift(
    notification
  );

  return notification;
}

export function getNotifications(
  userId?: string
) {
  if (!userId) {
    return [...notifications];
  }

  return notifications.filter(
    (item) =>
      item.userId === userId
  );
}

export function markAsRead(
  id: string
) {
  const notification =
    notifications.find(
      (item) =>
        item.id === id
    );

  if (!notification) {
    return null;
  }

  notification.read = true;

  return notification;
}

export function deleteNotification(
  id: string
) {
  const index =
    notifications.findIndex(
      (item) =>
        item.id === id
    );

  if (index === -1) {
    return false;
  }

  notifications.splice(
    index,
    1
  );

  return true;
}

export function clearNotifications() {
  notifications.length = 0;
}

export function unreadCount(
  userId?: string
) {
  return getNotifications(
    userId
  ).filter(
    (item) =>
      !item.read
  ).length;
}