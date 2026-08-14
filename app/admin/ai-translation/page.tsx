"use client";

import {
  useMemo,
  useState,
} from "react";

interface Model {
  id: number;
  code: string;
  introduction?: string | null;
  introductionEn?: string | null;
  introductionZhTW?: string | null;
  introductionZhCN?: string | null;
  introductionJa?: string | null;
  introductionKo?: string | null;
}

interface TranslationResponse {
  success?: boolean;
  data?: {
    source?: string;
    translations?: {
      zhTW?: string;
      zhCN?: string;
      ja?: string;
      ko?: string;
    };
    errors?: Record<string, string>;
  };
  message?: string;
  error?: string;
}

interface ModelsResponse {
  success?: boolean;
  data?: Model[];
  message?: string;
  error?: string;
}

type ProgressStatus =
  | "waiting"
  | "translating"
  | "completed"
  | "skipped"
  | "failed";

interface ProgressItem {
  id: number;
  code: string;
  status: ProgressStatus;
  message?: string;
}

const LANGUAGES = [
  "zhTW",
  "zhCN",
  "ja",
  "ko",
] as const;

const CONCURRENCY = 1;

function getSource(
  model: Model
): string {
  return (
    model.introductionEn?.trim() ||
    model.introduction?.trim() ||
    ""
  );
}

function getMissingLanguages(
  model: Model
): (typeof LANGUAGES)[number][] {
  const missing: (typeof LANGUAGES)[number][] = [];

  if (!model.introductionZhTW?.trim()) {
    missing.push("zhTW");
  }

  if (!model.introductionZhCN?.trim()) {
    missing.push("zhCN");
  }

  if (!model.introductionJa?.trim()) {
    missing.push("ja");
  }

  if (!model.introductionKo?.trim()) {
    missing.push("ko");
  }

  return missing;
}

function updateProgressItem(
  setProgress: React.Dispatch<
    React.SetStateAction<ProgressItem[]>
  >,
  id: number,
  update: Partial<ProgressItem>
) {
  setProgress((current) =>
    current.map((item) =>
      item.id === id
        ? {
            ...item,
            ...update,
          }
        : item
    )
  );
}

export default function AITranslationPage() {
  const [isTranslating, setIsTranslating] =
    useState(false);

  const [progress, setProgress] =
    useState<ProgressItem[]>([]);

  const [completed, setCompleted] =
    useState(0);

  const [total, setTotal] =
    useState(0);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [currentBatch, setCurrentBatch] =
    useState(0);

  const [totalBatches, setTotalBatches] =
    useState(0);

  async function translateModel(
    model: Model,
    force: boolean
  ): Promise<"completed" | "skipped" | "failed"> {
    const source = getSource(model);

    if (!source) {
      updateProgressItem(
        setProgress,
        model.id,
        {
          status: "skipped",
          message: "No English introduction.",
        }
      );

      return "skipped";
    }

    const languagesToTranslate = force
      ? [...LANGUAGES]
      : getMissingLanguages(model);

    if (languagesToTranslate.length === 0) {
      updateProgressItem(
        setProgress,
        model.id,
        {
          status: "skipped",
          message: "All translations already exist.",
        }
      );

      return "skipped";
    }

    updateProgressItem(
      setProgress,
      model.id,
      {
        status: "translating",
        message: force
          ? `Force re-translating ${languagesToTranslate.length} language(s)...`
          : `Translating ${languagesToTranslate.length} language(s)...`,
      }
    );

    try {
      const translationResponse =
        await fetch(
          "/api/admin/translation",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              source,
              languages: languagesToTranslate,
            }),
          }
        );

      const translationJson =
        (await translationResponse.json()) as TranslationResponse;

      if (!translationResponse.ok) {
        throw new Error(
          translationJson.message ||
            translationJson.error ||
            "Translation failed."
        );
      }

      const translations =
        translationJson.data?.translations;

      if (!translations) {
        throw new Error(
          "Translation API returned no translations."
        );
      }

      const updateBody: Record<string, string> = {
        introductionEn: source,
      };

      const savedLanguages: string[] = [];
      const failedLanguages: string[] = [];

      if (languagesToTranslate.includes("zhTW")) {
        if (translations.zhTW?.trim()) {
          updateBody.introductionZhTW =
            translations.zhTW.trim();
          savedLanguages.push("zhTW");
        } else {
          failedLanguages.push("zhTW");
        }
      }

      if (languagesToTranslate.includes("zhCN")) {
        if (translations.zhCN?.trim()) {
          updateBody.introductionZhCN =
            translations.zhCN.trim();
          savedLanguages.push("zhCN");
        } else {
          failedLanguages.push("zhCN");
        }
      }

      if (languagesToTranslate.includes("ja")) {
        if (translations.ja?.trim()) {
          updateBody.introductionJa =
            translations.ja.trim();
          savedLanguages.push("ja");
        } else {
          failedLanguages.push("ja");
        }
      }

      if (languagesToTranslate.includes("ko")) {
        if (translations.ko?.trim()) {
          updateBody.introductionKo =
            translations.ko.trim();
          savedLanguages.push("ko");
        } else {
          failedLanguages.push("ko");
        }
      }

      if (savedLanguages.length === 0) {
        throw new Error(
          "No usable translations returned."
        );
      }

      const updateResponse =
        await fetch(
          `/api/models/${model.id}`,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateBody),
          }
        );

      const updateJson =
        await updateResponse.json();

      if (!updateResponse.ok) {
        throw new Error(
          updateJson.message ||
            updateJson.error ||
            "Failed to save translations."
        );
      }

      updateProgressItem(
        setProgress,
        model.id,
        {
          status: "completed",
          message: force
            ? `Force re-translated ${savedLanguages.join(", ")}.`
            : `Translated ${savedLanguages.join(", ")}.`,
        }
      );

      return "completed";
    } catch (modelError) {
      const modelMessage =
        modelError instanceof Error
          ? modelError.message
          : String(modelError);

      updateProgressItem(
        setProgress,
        model.id,
        {
          status: "failed",
          message: modelMessage,
        }
      );

      return "failed";
    }
  }

  async function handleTranslateAll(
    force: boolean
  ) {
    if (isTranslating) {
      return;
    }

    if (force) {
      const confirmed = window.confirm(
        "Force re-translate ALL models?\n\n" +
          "This will OVERWRITE existing Traditional Chinese, Simplified Chinese, Japanese, and Korean introductions using the English source.\n\n" +
          "Make sure Ollama is running locally.\n\n" +
          "Continue?"
      );

      if (!confirmed) {
        return;
      }
    }

    setIsTranslating(true);
    setProgress([]);
    setCompleted(0);
    setTotal(0);
    setCurrentBatch(0);
    setTotalBatches(0);
    setMessage("");
    setError("");

    try {
      const modelsResponse =
        await fetch(
          "/api/models",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

      const modelsJson =
        (await modelsResponse.json()) as ModelsResponse;

      if (!modelsResponse.ok) {
        throw new Error(
          modelsJson.message ||
            modelsJson.error ||
            "Failed to load models."
        );
      }

      const models =
        Array.isArray(modelsJson.data)
          ? modelsJson.data
          : [];

      if (models.length === 0) {
        setMessage("No models found.");
        return;
      }

      const initialProgress =
        models.map((model) => {
          const source = getSource(model);

          if (!source) {
            return {
              id: model.id,
              code: model.code,
              status: "skipped" as const,
              message: "No English introduction.",
            };
          }

          if (
            !force &&
            getMissingLanguages(model).length === 0
          ) {
            return {
              id: model.id,
              code: model.code,
              status: "skipped" as const,
              message: "All translations already exist.",
            };
          }

          return {
            id: model.id,
            code: model.code,
            status: "waiting" as const,
          };
        });

      setProgress(initialProgress);
      setTotal(models.length);

      const queue =
        models.filter((model) => {
          if (!getSource(model)) {
            return false;
          }

          if (force) {
            return true;
          }

          return getMissingLanguages(model).length > 0;
        });

      const batches = Math.ceil(
        queue.length / CONCURRENCY
      );

      setTotalBatches(batches);

      let processedCount =
        initialProgress.filter(
          (item) => item.status === "skipped"
        ).length;

      setCompleted(processedCount);

      for (
        let index = 0;
        index < queue.length;
        index += CONCURRENCY
      ) {
        const batch =
          queue.slice(
            index,
            index + CONCURRENCY
          );

        const batchNumber =
          Math.floor(index / CONCURRENCY) + 1;

        setCurrentBatch(batchNumber);

        await Promise.all(
          batch.map((model) =>
            translateModel(model, force)
          )
        );

        processedCount += batch.length;
        setCompleted(processedCount);
      }

      const skippedCount =
        initialProgress.filter(
          (item) => item.status === "skipped"
        ).length;

      setMessage(
        queue.length === 0
          ? force
            ? `No models with English introduction found among ${models.length} models.`
            : `All ${models.length} models already have complete translations. No Qwen requests were needed.`
          : force
            ? `Force re-translation completed. ${queue.length} model(s) processed with ${batches} batch(es). ${skippedCount} model(s) skipped (no English).`
            : `Translation completed. ${queue.length} model(s) processed with ${batches} batch(es). ${skippedCount} model(s) skipped.`
      );
    } catch (requestError) {
      const requestMessage =
        requestError instanceof Error
          ? requestError.message
          : String(requestError);

      setError(requestMessage);
    } finally {
      setIsTranslating(false);
    }
  }

  const successfulCount = useMemo(
    () =>
      progress.filter(
        (item) => item.status === "completed"
      ).length,
    [progress]
  );

  const skippedCount = useMemo(
    () =>
      progress.filter(
        (item) => item.status === "skipped"
      ).length,
    [progress]
  );

  const failedCount = useMemo(
    () =>
      progress.filter(
        (item) => item.status === "failed"
      ).length,
    [progress]
  );

  const translatingCount = useMemo(
    () =>
      progress.filter(
        (item) => item.status === "translating"
      ).length,
    [progress]
  );

  const waitingCount = useMemo(
    () =>
      progress.filter(
        (item) => item.status === "waiting"
      ).length,
    [progress]
  );

  const progressPercent =
    total > 0
      ? Math.round((completed / total) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white sm:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="uppercase tracking-[0.4em] text-yellow-500">
          CYLG CMS
        </p>

        <h1 className="mt-4 text-4xl font-black sm:text-5xl">
          AI Translation
        </h1>

        <p className="mt-4 max-w-3xl text-gray-400">
          Automatically translate only models that are
          missing one or more language versions. Each
          model uses one Batch Qwen request for all
          required languages. Use Force Re-translate to
          overwrite all existing translations.
        </p>

        <div className="mt-10 rounded-3xl border border-yellow-500/20 bg-[#101010] p-6 sm:p-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Batch Translation
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Qwen concurrency:{" "}
                <span className="text-yellow-400">
                  {CONCURRENCY}
                </span>{" "}
                models at a time
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => handleTranslateAll(false)}
                disabled={isTranslating}
                className="
                  rounded-full
                  border
                  border-yellow-500
                  px-8
                  py-4
                  font-bold
                  text-yellow-500
                  transition
                  hover:bg-yellow-500/10
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {isTranslating
                  ? "TRANSLATING..."
                  : "TRANSLATE MISSING MODELS"}
              </button>

              <button
                type="button"
                onClick={() => handleTranslateAll(true)}
                disabled={isTranslating}
                className="
                  rounded-full
                  bg-yellow-500
                  px-8
                  py-4
                  font-bold
                  text-black
                  transition
                  hover:bg-yellow-400
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {isTranslating
                  ? "TRANSLATING..."
                  : "FORCE RE-TRANSLATE ALL"}
              </button>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/5 bg-black/30 p-5">
            <p className="text-sm leading-7 text-gray-400">
              <span className="text-yellow-400">TRANSLATE MISSING MODELS</span>
              {" "}— existing complete translations are skipped.
              Only missing languages are requested.
            </p>

            <p className="mt-2 text-sm leading-7 text-gray-400">
              <span className="text-yellow-400">FORCE RE-TRANSLATE ALL</span>
              {" "}— overwrite 繁中 / 简中 / 日本語 / 한국어 for every
              model that has an English introduction. Local Ollama required.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              English → 繁體中文 → 简体中文 → 日本語 → 한국어
            </p>
          </div>

          {total > 0 && (
            <div className="mt-8">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-400">
                <span>Overall Progress</span>

                <span className="font-semibold text-yellow-400">
                  {completed} / {total} ({progressPercent}%)
                </span>
              </div>

              <div className="mt-3 h-3 overflow-hidden rounded-full bg-black">
                <div
                  className="
                    h-full
                    rounded-full
                    bg-yellow-500
                    transition-all
                    duration-300
                  "
                  style={{
                    width: `${progressPercent}%`,
                  }}
                />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-xl border border-white/5 bg-black/40 px-4 py-3">
                  <p className="text-xs uppercase tracking-wider text-gray-600">
                    Total
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    {total}
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-black/40 px-4 py-3">
                  <p className="text-xs uppercase tracking-wider text-gray-600">
                    Completed
                  </p>
                  <p className="mt-1 text-xl font-bold text-green-400">
                    {successfulCount}
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-black/40 px-4 py-3">
                  <p className="text-xs uppercase tracking-wider text-gray-600">
                    Skipped
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-400">
                    {skippedCount}
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-black/40 px-4 py-3">
                  <p className="text-xs uppercase tracking-wider text-gray-600">
                    Translating
                  </p>
                  <p className="mt-1 text-xl font-bold text-yellow-400">
                    {translatingCount}
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-black/40 px-4 py-3">
                  <p className="text-xs uppercase tracking-wider text-gray-600">
                    Failed
                  </p>
                  <p className="mt-1 text-xl font-bold text-red-400">
                    {failedCount}
                  </p>
                </div>
              </div>

              {isTranslating && totalBatches > 0 && (
                <p className="mt-5 text-sm text-gray-500">
                  Batch{" "}
                  <span className="text-yellow-400">
                    {currentBatch}
                  </span>{" "}
                  / {totalBatches}
                  {" · "}
                  Waiting: {waitingCount}
                </p>
              )}

              <div className="mt-8 space-y-3">
                {progress.map((item) => (
                  <div
                    key={item.id}
                    className="
                      flex
                      flex-col
                      gap-2
                      rounded-xl
                      border
                      border-white/5
                      bg-black/40
                      px-5
                      py-4
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                    "
                  >
                    <span className="font-semibold">
                      {item.code}
                    </span>

                    <span
                      className={
                        item.status === "completed"
                          ? "text-green-400"
                          : item.status === "failed"
                            ? "text-red-400"
                            : item.status === "skipped"
                              ? "text-gray-500"
                              : item.status === "translating"
                                ? "text-yellow-400"
                                : "text-gray-600"
                      }
                    >
                      {item.status === "waiting" &&
                        "Waiting"}

                      {item.status === "translating" &&
                        (item.message || "Translating...")}

                      {item.status === "completed" &&
                        `✓ ${item.message || "Completed"}`}

                      {item.status === "skipped" &&
                        `Skipped · ${
                          item.message || "Already complete"
                        }`}

                      {item.status === "failed" &&
                        `✕ ${
                          item.message || "Failed"
                        }`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {message && (
            <div className="mt-8 rounded-xl border border-green-500/20 bg-green-500/5 px-5 py-4 text-sm text-green-400">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}