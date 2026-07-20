export type QueueJobStatus =
  | "WAITING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export interface QueueJob<T = unknown> {
  id: string;
  name: string;
  payload: T;
  status: QueueJobStatus;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

const jobs: QueueJob[] = [];

function generateId() {
  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .slice(2, 10)
  );
}

export function addJob<T>(
  name: string,
  payload: T
) {
  const job: QueueJob<T> = {
    id: generateId(),
    name,
    payload,
    status: "WAITING",
    createdAt: new Date(),
  };

  jobs.push(job);

  return job;
}

export function getJobs() {
  return [...jobs];
}

export function getJob(
  id: string
) {
  return (
    jobs.find(
      (job) =>
        job.id === id
    ) ?? null
  );
}

export function updateJobStatus(
  id: string,
  status: QueueJobStatus,
  error?: string
) {
  const job =
    jobs.find(
      (item) =>
        item.id === id
    );

  if (!job) {
    return null;
  }

  job.status = status;

  if (
    status === "COMPLETED" ||
    status === "FAILED"
  ) {
    job.completedAt =
      new Date();
  }

  if (error) {
    job.error = error;
  }

  return job;
}

export function removeJob(
  id: string
) {
  const index =
    jobs.findIndex(
      (job) =>
        job.id === id
    );

  if (index === -1) {
    return false;
  }

  jobs.splice(index, 1);

  return true;
}

export function clearQueue() {
  jobs.length = 0;
}

export function getPendingJobs() {
  return jobs.filter(
    (job) =>
      job.status === "WAITING"
  );
}