"use client";

import { useLanguage } from "@/app/providers/LanguageProvider";
import ModelInfo from "@/components/model/ModelInfo";

interface LocalizedModelInfoProps {
  age: number;
  height: number;
  weight: number;
  city: string;
  nationality: string;
  languages: string[];

  introduction: string;
  introductionEn: string;
  introductionZhTW: string;
  introductionZhCN: string;
  introductionJa: string;
  introductionKo: string;
}

export default function LocalizedModelInfo({
  age,
  height,
  weight,
  city,
  nationality,
  languages,
  introduction,
  introductionEn,
  introductionZhTW,
  introductionZhCN,
  introductionJa,
  introductionKo,
}: LocalizedModelInfoProps) {
  const { locale } = useLanguage();

  const localizedIntroduction =
    locale === "zh-TW"
      ? introductionZhTW || introduction
      : locale === "zh-CN"
        ? introductionZhCN || introduction
        : locale === "ja"
          ? introductionJa || introduction
          : locale === "ko"
            ? introductionKo || introduction
            : introductionEn || introduction;

  return (
    <ModelInfo
      age={age}
      height={height}
      weight={weight}
      city={city}
      nationality={nationality}
      languages={languages}
      introduction={localizedIntroduction}
    />
  );
}
