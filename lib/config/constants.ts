export const PROJECT = {
  NAME: "ChaYanLongGong",
  SHORT_NAME: "CYLG",
  VERSION: "1.0.0",
} as const;


export const URLS = {
  HOME: "/",
  MODELS: "/models",
  ADMIN: "/admin",
  LOGIN: "/admin/login",
} as const;


export const DATABASE = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;


export const SECURITY = {
  SESSION_DURATION:
    1000 * 60 * 60 * 24 * 7,

  MAX_LOGIN_ATTEMPTS: 5,

  LOCK_TIME:
    1000 * 60 * 15,
} as const;


export const UPLOAD = {
  MAX_IMAGE_SIZE:
    10 * 1024 * 1024,

  MAX_VIDEO_SIZE:
    100 * 1024 * 1024,

  ALLOWED_IMAGES: [
    "image/jpeg",
    "image/png",
    "image/webp",
  ],

  ALLOWED_VIDEOS: [
    "video/mp4",
    "video/webm",
  ],
} as const;


export const MODEL = {
  LEVELS: [
    "CROWN",
    "SSS",
    "SS",
    "S",
    "A",
  ],

  DEFAULT_LEVEL: "A",

  MIN_AGE: 18,
} as const;


export const CONTACT = {
  TYPES: [
    "WHATSAPP",
    "TELEGRAM",
    "SIGNAL",
    "LINE",
    "WECHAT",
    "EMAIL",
  ],
} as const;


export const CACHE = {
  DEFAULT_TTL: 60,

  SHORT_TTL: 30,

  LONG_TTL: 3600,
} as const;