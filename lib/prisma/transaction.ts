import {
  Prisma,
  PrismaClient,
} from "@prisma/client";

import {
  prisma,
} from "./index";


export async function transaction<T>(
  callback: (
    tx: Prisma.TransactionClient
  ) => Promise<T>
): Promise<T> {

  return prisma.$transaction(
    async (
      tx: Prisma.TransactionClient
    ) => {

      return callback(tx);

    }
  );

}