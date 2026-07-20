import { prisma } from "@/lib/prisma";

export async function findMany<T>(
  query: () => Promise<T[]>
): Promise<T[]> {
  return query();
}

export async function findFirst<T>(
  query: () => Promise<T | null>
): Promise<T | null> {
  return query();
}

export async function findUnique<T>(
  query: () => Promise<T | null>
): Promise<T | null> {
  return query();
}

export async function createRecord<T>(
  query: () => Promise<T>
): Promise<T> {
  return query();
}

export async function updateRecord<T>(
  query: () => Promise<T>
): Promise<T> {
  return query();
}

export async function deleteRecord<T>(
  query: () => Promise<T>
): Promise<T> {
  return query();
}

export async function countRecords(
  query: () => Promise<number>
) {
  return query();
}

export async function databaseHealthCheck() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return {
      connected: true,
    };
  } catch {
    return {
      connected: false,
    };
  }
}