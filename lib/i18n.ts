import en from "@/messages/en";
import zhTW from "@/messages/zh-TW";
import zhCN from "@/messages/zh-CN";
import ja from "@/messages/ja";
import ko from "@/messages/ko";

export const locales = {
  en,
  "zh-TW": zhTW,
  "zh-CN": zhCN,
  ja,
  ko,
};

export type Locale = keyof typeof locales;

export const defaultLocale: Locale = "en";

export function getMessages(locale: string) {
  return locales[locale as Locale] ?? locales[defaultLocale];
}