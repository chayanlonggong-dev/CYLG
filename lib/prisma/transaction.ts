import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function runTransaction<T>(
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    return callback(tx as PrismaClient);
  });
}

export async function runBatch(
  operations: Parameters<PrismaClient["$transaction"]>[0]
) {
  return prisma.$transaction(operations);
}