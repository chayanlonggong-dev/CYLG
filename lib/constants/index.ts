export const APP_NAME = "ChaYanLongGong";

export const APP_SHORT_NAME = "CYLG";

export const DEFAULT_LANGUAGE = "en";

export const SUPPORTED_LANGUAGES = [
  "en",
  "zhTW",
  "zhCN",
  "ja",
  "ko",
] as const;

export const MODEL_LEVELS = [
  "CROWN",
  "SSS",
  "SS",
  "S",
  "A",
] as const;

export const MODEL_LEVEL_ORDER = {
  CROWN: 1,
  SSS: 2,
  SS: 3,
  S: 4,
  A: 5,
} as const;

export const WEBSITE_SETTINGS_ID = 1;

export const MAX_GALLERY_IMAGES = 20;

export const MAX_VIDEO_FILES = 10;

export const MAX_UPLOAD_SIZE_MB = 50;

export const SESSION_COOKIE_NAME =
  "cylg_session";

export const ADMIN_COOKIE_NAME =
  "cylg_admin";

export const API_RATE_LIMIT = 120;

export const CACHE_DEFAULT_TTL = 60;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const FILE_TYPES = {
  IMAGE: [
    "image/jpeg",
    "image/png",
    "image/webp",
  ],

  VIDEO: [
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ],
} as const;