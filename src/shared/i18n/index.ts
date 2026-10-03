// Client-safe surface. Cookie-based locale lookup lives in ./server.ts.
export {
  DEFAULT_LOCALE,
  INTL_LOCALES,
  isLocale,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALES,
} from "./config";
export type { Locale } from "./config";
export { getDictionaryFor } from "./dictionaries";
export { useDictionary, useLocale } from "./hooks";
export { I18nProvider } from "./I18nProvider";
export type { Dictionary, I18nProviderProps } from "./types";
