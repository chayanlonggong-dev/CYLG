import type { ModelLevel } from "@prisma/client";

export interface ModelBasic {
  id: number;
  code: string;
  level: ModelLevel;
  number: number;
}

export interface ModelProfile {
  id: number;
  code: string;
  level: ModelLevel;
  number: number;

  title?: string;

  age: number;
  height: number;
  weight: number;

  city: string;
  nationality: string;

  languages: string;
  services?: string;

  avatar: string;
  gallery: string;
  videos: string;

  introduction: string;

  online: boolean;
  featured: boolean;
}

export interface ModelCard {
  id: number;
  code: string;
  avatar: string;
  level: ModelLevel;
}

export interface ModelCreateInput {
  level: ModelLevel;

  avatar: string;
  gallery?: string;
  videos?: string;

  introduction: string;
}

export interface ModelUpdateInput {
  level?: ModelLevel;

  number?: number;
  code?: string;

  title?: string;

  age?: number;
  height?: number;
  weight?: number;

  city?: string;
  nationality?: string;

  languages?: string;
  services?: string;

  avatar?: string;
  gallery?: string;
  videos?: string;

  introduction?: string;

  online?: boolean;
  featured?: boolean;
}

export interface ModelFilter {
  level?: ModelLevel;
  online?: boolean;
  featured?: boolean;
  search?: string;
}