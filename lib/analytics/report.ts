import {
  getEvents,
  type AnalyticsEvent,
} from "./analytics";

export interface AnalyticsReport {
  totalEvents: number;
  eventBreakdown: Record<
    string,
    number
  >;
  topPaths: {
    path: string;
    count: number;
  }[];
}

export function generateAnalyticsReport(): AnalyticsReport {
  const events = getEvents();

  const eventBreakdown: Record<
    string,
    number
  > = {};

  const pathCount: Record<
    string,
    number
  > = {};

  for (const event of events) {
    eventBreakdown[event.event] =
      (eventBreakdown[event.event] ?? 0) + 1;

    if (event.path) {
      pathCount[event.path] =
        (pathCount[event.path] ?? 0) + 1;
    }
  }

  const topPaths = Object.entries(
    pathCount
  )
    .map(([path, count]) => ({
      path,
      count,
    }))
    .sort(
      (a, b) =>
        b.count - a.count
    )
    .slice(0, 10);

  return {
    totalEvents: events.length,
    eventBreakdown,
    topPaths,
  };
}

export function countEvent(
  eventType: AnalyticsEvent
) {
  return getEvents().filter(
    (event) =>
      event.event === eventType
  ).length;
}

export function getConversionRate(
  startEvent: AnalyticsEvent,
  completeEvent: AnalyticsEvent
) {
  const start =
    countEvent(startEvent);

  const complete =
    countEvent(completeEvent);

  if (start === 0) {
    return 0;
  }

  return Number(
    (
      (complete / start) *
      100
    ).toFixed(2)
  );
}