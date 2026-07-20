import {
  getPendingJobs,
  updateJobStatus,
  type QueueJob,
} from "./queue";

type JobHandler<T = unknown> = (
  payload: T
) => Promise<void>;

const handlers = new Map<
  string,
  JobHandler
>();

export function registerWorker<T>(
  name: string,
  handler: JobHandler<T>
) {
  handlers.set(
    name,
    handler as JobHandler
  );
}

export async function processJob(
  job: QueueJob
) {
  const handler =
    handlers.get(job.name);

  if (!handler) {
    updateJobStatus(
      job.id,
      "FAILED",
      `No worker found for job: ${job.name}`
    );

    return false;
  }

  try {
    updateJobStatus(
      job.id,
      "PROCESSING"
    );

    await handler(
      job.payload
    );

    updateJobStatus(
      job.id,
      "COMPLETED"
    );

    return true;

  } catch (error) {
    updateJobStatus(
      job.id,
      "FAILED",
      error instanceof Error
        ? error.message
        : String(error)
    );

    return false;
  }
}

export async function runQueueWorker() {
  const jobs =
    getPendingJobs();

  const results = [];

  for (const job of jobs) {
    const result =
      await processJob(job);

    results.push({
      id: job.id,
      success: result,
    });
  }

  return results;
}

export function getRegisteredWorkers() {
  return Array.from(
    handlers.keys()
  );
}