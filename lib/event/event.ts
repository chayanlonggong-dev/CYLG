export type EventHandler<T = unknown> = (
  payload: T
) => void | Promise<void>;

export interface EventRecord<T = unknown> {
  name: string;
  payload: T;
  createdAt: Date;
}

const listeners = new Map<
  string,
  EventHandler[]
>();

const history: EventRecord[] = [];

export function on<T>(
  eventName: string,
  handler: EventHandler<T>
) {
  const handlers =
    listeners.get(eventName) ?? [];

  handlers.push(
    handler as EventHandler
  );

  listeners.set(
    eventName,
    handlers
  );

  return () => {
    off(
      eventName,
      handler
    );
  };
}

export function off<T>(
  eventName: string,
  handler: EventHandler<T>
) {
  const handlers =
    listeners.get(eventName);

  if (!handlers) {
    return;
  }

  listeners.set(
    eventName,
    handlers.filter(
      (item) =>
        item !== handler
    )
  );
}

export async function emit<T>(
  eventName: string,
  payload: T
) {
  const record: EventRecord<T> = {
    name: eventName,
    payload,
    createdAt: new Date(),
  };

  history.unshift(record);

  const handlers =
    listeners.get(eventName) ?? [];

  for (const handler of handlers) {
    await handler(payload);
  }

  return true;
}

export function getEventHistory() {
  return [...history];
}

export function clearEventHistory() {
  history.length = 0;
}

export function removeAllListeners(
  eventName?: string
) {
  if (eventName) {
    listeners.delete(eventName);
    return;
  }

  listeners.clear();
}

export function getRegisteredEvents() {
  return Array.from(
    listeners.keys()
  );
}