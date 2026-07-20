export type ScheduleStatus =
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED";

export interface ScheduledTask {
  id: string;
  name: string;
  interval: number;
  status: ScheduleStatus;
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
}

const tasks: ScheduledTask[] = [];

const handlers = new Map<
  string,
  () => Promise<void> | void
>();

function generateId() {
  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .slice(2, 10)
  );
}

export function registerTask(
  name: string,
  interval: number,
  handler: () => Promise<void> | void
) {
  const task: ScheduledTask = {
    id: generateId(),
    name,
    interval,
    status: "ACTIVE",
    nextRun: new Date(
      Date.now() + interval
    ),
    createdAt: new Date(),
  };

  tasks.push(task);

  handlers.set(
    task.id,
    handler
  );

  return task;
}

export async function runTask(
  id: string
) {
  const task =
    tasks.find(
      (item) =>
        item.id === id
    );

  const handler =
    handlers.get(id);

  if (!task || !handler) {
    return false;
  }

  await handler();

  task.lastRun = new Date();

  task.nextRun = new Date(
    Date.now() + task.interval
  );

  return true;
}

export async function runAllTasks() {
  const results = [];

  for (const task of tasks) {
    if (
      task.status === "ACTIVE"
    ) {
      const success =
        await runTask(task.id);

      results.push({
        id: task.id,
        success,
      });
    }
  }

  return results;
}

export function pauseTask(
  id: string
) {
  const task =
    tasks.find(
      (item) =>
        item.id === id
    );

  if (!task) {
    return false;
  }

  task.status = "PAUSED";

  return true;
}

export function resumeTask(
  id: string
) {
  const task =
    tasks.find(
      (item) =>
        item.id === id
    );

  if (!task) {
    return false;
  }

  task.status = "ACTIVE";

  return true;
}

export function getTasks() {
  return [...tasks];
}

export function deleteTask(
  id: string
) {
  const index =
    tasks.findIndex(
      (task) =>
        task.id === id
    );

  if (index === -1) {
    return false;
  }

  tasks.splice(index, 1);

  handlers.delete(id);

  return true;
}

export function clearTasks() {
  tasks.length = 0;
  handlers.clear();
}