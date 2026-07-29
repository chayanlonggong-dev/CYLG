"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import CollectionCard from "@/components/collection/CollectionCard";
import { useLanguage } from "@/app/providers/LanguageProvider";

interface Model {
  id: number;
  code: string;
  level: "CROWN" | "SSS" | "SS" | "S" | "A";
  avatar: string;
  gallery: string | null;
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
  const searchParams = useSearchParams();

  const [level, setLevel] = useState("");
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  const restoredNavigation = useRef(false);

  const restoreStorageKey = "cylg-collection-restore";
  const cacheKey = "cylg-models-cache";

  useEffect(() => {
    async function loadData() {
      try {
        const paramsData = await params;
        const currentLevel = paramsData.level.toUpperCase();

        setLevel(currentLevel);

        // ---------- 优先读取缓存 ----------
const cached =
  sessionStorage.getItem(cacheKey);

if (cached) {
  try {
    const cacheModels: Model[] =
      JSON.parse(cached);

    const filtered =
      cacheModels.filter(
        (model) =>
          model.level === currentLevel
      );

    setModels(filtered);
    setLoading(false);

    // 已有缓存，不再重新请求 API，
    // 避免返回 Collection 时再次渲染整个 Grid。
    return;
  } catch {
    sessionStorage.removeItem(cacheKey);
  }
}

// ---------- 首次进入才请求 ----------
const res = await fetch("/api/models", {
  cache: "no-store",
});

const data = await res.json();

if (Array.isArray(data)) {
  sessionStorage.setItem(
    cacheKey,
    JSON.stringify(data)
  );

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
    if (loading || restoredNavigation.current) {
      return;
    }

    const modelCode =
      searchParams.get("returnModel") ||
      sessionStorage.getItem(
        `${restoreStorageKey}-model`
      );

    const scrollY = Number(
      searchParams.get("returnScroll") ||
        sessionStorage.getItem(
          `${restoreStorageKey}-scroll`
        )
    );

    if (
      !modelCode ||
      !Number.isFinite(scrollY) ||
      scrollY < 0
    ) {
      return;
    }

    restoredNavigation.current = true;

    requestAnimationFrame(() => {
      window.scrollTo({
        top: scrollY,
        behavior: "auto",
      });
    });
  }, [loading, searchParams]);

  function preserveCollectionPosition(
    modelCode: string
  ) {
    const returnUrl = new URL(window.location.href);

    const scrollY = window.scrollY || 0;

    returnUrl.searchParams.set(
      "returnModel",
      modelCode
    );

    returnUrl.searchParams.set(
      "returnScroll",
      String(scrollY)
    );

    sessionStorage.setItem(
      `${restoreStorageKey}-model`,
      modelCode
    );

    sessionStorage.setItem(
      `${restoreStorageKey}-scroll`,
      String(scrollY)
    );

    window.history.replaceState(
      {
        ...window.history.state,
        returnModel: modelCode,
        returnScroll: scrollY,
      },
      "",
      returnUrl
    );
  }

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
                onNavigate={
                  preserveCollectionPosition
                }
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