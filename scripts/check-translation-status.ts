import { prisma } from "@/lib/prisma";

async function main() {
  const models = await prisma.model.findMany({
    orderBy: {
      code: "asc",
    },
  });

  let en = 0;
  let zhTW = 0;
  let zhCN = 0;
  let ja = 0;
  let ko = 0;
  let withoutIntro = 0;

  console.log("=== TRANSLATION STATUS CHECK ===");
  console.log("");

  for (const model of models) {
    const hasEN =
      typeof model.introduction === "string" &&
      model.introduction.trim().length > 0;

    const hasTW =
      typeof model.introductionZhTW === "string" &&
      model.introductionZhTW.trim().length > 0;

    const hasCN =
      typeof model.introductionZhCN === "string" &&
      model.introductionZhCN.trim().length > 0;

    const hasJA =
      typeof model.introductionJa === "string" &&
      model.introductionJa.trim().length > 0;

    const hasKO =
      typeof model.introductionKo === "string" &&
      model.introductionKo.trim().length > 0;

    if (hasEN) en++;
    if (hasTW) zhTW++;
    if (hasCN) zhCN++;
    if (hasJA) ja++;
    if (hasKO) ko++;
    if (!hasEN) withoutIntro++;
  }

  console.log(`TOTAL MODELS: ${models.length}`);
  console.log(`EN: ${en}`);
  console.log(`zhTW: ${zhTW}`);
  console.log(`zhCN: ${zhCN}`);
  console.log(`JA: ${ja}`);
  console.log(`KO: ${ko}`);
  console.log(`WITHOUT INTRO: ${withoutIntro}`);

  console.log("");
  console.log("=== FIRST 20 MODELS ===");

  for (const model of models.slice(0, 20)) {
    const hasEN =
      typeof model.introduction === "string" &&
      model.introduction.trim().length > 0;

    const hasTW =
      typeof model.introductionZhTW === "string" &&
      model.introductionZhTW.trim().length > 0;

    const hasCN =
      typeof model.introductionZhCN === "string" &&
      model.introductionZhCN.trim().length > 0;

    const hasJA =
      typeof model.introductionJa === "string" &&
      model.introductionJa.trim().length > 0;

    const hasKO =
      typeof model.introductionKo === "string" &&
      model.introductionKo.trim().length > 0;

    console.log(
      `${model.code} | EN: ${hasEN} | TW: ${hasTW} | CN: ${hasCN} | JA: ${hasJA} | KO: ${hasKO}`
    );
  }

  console.log("");
  console.log("=== INCOMPLETE MODELS ===");

  let incomplete = 0;

  for (const model of models) {
    const hasEN =
      typeof model.introduction === "string" &&
      model.introduction.trim().length > 0;

    const hasTW =
      typeof model.introductionZhTW === "string" &&
      model.introductionZhTW.trim().length > 0;

    const hasCN =
      typeof model.introductionZhCN === "string" &&
      model.introductionZhCN.trim().length > 0;

    const hasJA =
      typeof model.introductionJa === "string" &&
      model.introductionJa.trim().length > 0;

    const hasKO =
      typeof model.introductionKo === "string" &&
      model.introductionKo.trim().length > 0;

    if (
      !hasEN ||
      !hasTW ||
      !hasCN ||
      !hasJA ||
      !hasKO
    ) {
      incomplete++;

      console.log(
        `${model.code} | EN: ${hasEN} | TW: ${hasTW} | CN: ${hasCN} | JA: ${hasJA} | KO: ${hasKO}`
      );
    }
  }

  console.log("");
  console.log(
    `INCOMPLETE TOTAL: ${incomplete}`
  );
}

main()
  .catch((error) => {
    console.error("");
    console.error(
      "STATUS CHECK ERROR:"
    );
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
