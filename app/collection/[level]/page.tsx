"use client";

import {
  useEffect,
  useState,
} from "react";

const LAST_OPENED_MODEL_KEY = "cylg-last-opened-model";
import CollectionCard from "@/components/collection/CollectionCard";
import { useLanguage } from "@/app/providers/LanguageProvider";

interface Model {
  id: number;
  code: string;
  level: "CROWN" | "SSS" | "SS" | "S" | "A";
  avatar: string;
  gallery: string | null;
  online: boolean;
}

interface PageProps {
  params: Promise<{
    level: string;
  }>;
}

export default function LevelPage({
  params,
}: PageProps) {
  const { messages } = useLanguage();

  const [level, setLevel] = useState("");
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const paramsData = await params;
        const currentLevel = paramsData.level.toUpperCase();

        setLevel(currentLevel);

        const res = await fetch("/api/models", {
          cache: "no-store",
        });

        const payload = await res.json();
        const data = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];

        if (Array.isArray(data)) {
          const filtered = data.filter(
            (model: Model) =>
              model.level === currentLevel
          );

          setModels(filtered);
        } else {
          setModels([]);
        }
      } catch (error) {
        console.error(error);
        setModels([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params]);

  useEffect(() => {
    if (typeof window === "undefined" || loading) {
      return;
    }

    const savedModelCode = sessionStorage.getItem(LAST_OPENED_MODEL_KEY);

    if (!savedModelCode) {
      return;
    }

    const restoreCardIntoView = () => {
      const target = document.querySelector<HTMLElement>(
        `[data-model-code="${savedModelCode}"]`
      );

      if (target) {
        target.scrollIntoView({
          behavior: "auto",
          block: "center",
        });
        return true;
      }

      return false;
    };

    const isMobile = window.matchMedia(
      "(max-width: 1023px)"
    ).matches;

    if (!isMobile) {
      const tryRestore = (attempt = 0) => {
        if (restoreCardIntoView()) {
          return;
        }

        if (attempt >= 4) {
          return;
        }

        window.setTimeout(() => {
          tryRestore(attempt + 1);
        }, 150 * (attempt + 1));
      };

      window.requestAnimationFrame(() => {
        tryRestore();
      });

      return;
    }

    const previousScrollRestoration =
      window.history.scrollRestoration;

    window.history.scrollRestoration = "manual";

    let restoreTimer: number | undefined;
    let cancelled = false;

    const restoreAfterLayoutSettles = async () => {
      await document.fonts.ready;

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          restoreTimer = window.setTimeout(() => {
            if (!cancelled) {
              restoreCardIntoView();
            }
          }, 250);
        });
      });
    };

    restoreAfterLayoutSettles();

    return () => {
      cancelled = true;

      if (restoreTimer !== undefined) {
        window.clearTimeout(restoreTimer);
      }

      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, [loading, level, models.length]);

  const titleMap = {
    CROWN: `👑 ${messages.collection.crown}`,
    SSS: messages.collection.sss,
    SS: messages.collection.ss,
    S: messages.collection.s,
    A: messages.collection.a,
  };

  return (
    <main className="min-h-screen bg-black px-8 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-bold text-yellow-500">
            {titleMap[level as keyof typeof titleMap] ??
              messages.nav.collection}
          </h1>

          <p className="mt-5 text-gray-500">
            {models.length}{" "}
            {messages.collection.profiles}
          </p>
        </div>

        {loading ? (
          <p className="text-center text-gray-400">
            {messages.collection.loading}
          </p>
        ) : models.length === 0 ? (
          <p className="text-center text-gray-500">
            {messages.collection.noModels}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-3">
            {models.map((model) => (
              <CollectionCard
                key={model.id}
                id={model.code}
                online={Boolean(model.online)}
                onNavigate={(modelCode) => {
                  sessionStorage.setItem(LAST_OPENED_MODEL_KEY, modelCode);
                }}
                images={[
                  model.avatar,
                  ...(model.gallery
                    ? model.gallery
                        .split(",")
                        .filter(Boolean)
                    : []),
                ]}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}