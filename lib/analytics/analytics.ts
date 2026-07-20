export type AnalyticsEvent =
  | "PAGE_VIEW"
  | "MODEL_VIEW"
  | "CONTACT_CLICK"
  | "BOOKING_START"
  | "BOOKING_COMPLETE"
  | "LOGIN"
  | "LOGOUT";

export interface AnalyticsRecord {
  id: string;
  event: AnalyticsEvent;
  path?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const events: AnalyticsRecord[] = [];

function generateId() {
  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .slice(2, 10)
  );
}

export function trackEvent(
  event: AnalyticsEvent,
  options?: {
    path?: string;
    userId?: string;
    metadata?: Record<string, unknown>;
  }
) {
  const record: AnalyticsRecord = {
    id: generateId(),
    event,
    path: options?.path,
    userId: options?.userId,
    metadata: options?.metadata,
    createdAt: new Date(),
  };

  events.unshift(record);

  if (events.length > 10000) {
    events.pop();
  }

  return record;
}

export function getEvents() {
  return [...events];
}

export function getEventsByType(
  event: AnalyticsEvent
) {
  return events.filter(
    (item) =>
      item.event === event
  );
}

export function getEventCount(
  event?: AnalyticsEvent
) {
  if (!event) {
    return events.length;
  }

  return events.filter(
    (item) =>
      item.event === event
  ).length;
}

export function clearEvents() {
  events.length = 0;
}