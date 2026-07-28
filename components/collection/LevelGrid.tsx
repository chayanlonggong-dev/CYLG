"use client";

import LevelCard from "./LevelCard";

interface Model {
  level:
    | "CROWN"
    | "SSS"
    | "SS"
    | "S"
    | "A";
}

interface LevelGridProps {
  models: Model[];
}

const levels = [
  "CROWN",
  "SSS",
  "SS",
  "S",
  "A",
] as const;

export default function LevelGrid({
  models,
}: LevelGridProps) {
  return (
    <div
      className="
        mx-auto
        grid
        max-w-5xl
        grid-cols-1
        gap-6
        sm:grid-cols-2
        md:grid-cols-3
        xl:grid-cols-4
        xl:gap-8
      "
    >
      {levels.map((level) => {
        const count = models.filter(
          (model) => model.level === level
        ).length;

        return (
          <LevelCard
            key={level}
            level={level}
            count={count}
          />
        );
      })}
    </div>
  );
}