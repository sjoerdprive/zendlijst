export const LOCALES = ["nl", "en"] as const;

export type Locale = (typeof LOCALES)[number];

// Dutch is the platform's main language; English is opt-in via the switcher.
export const DEFAULT_LOCALE: Locale = "nl";

export const LOCALE_COOKIE = "locale";

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// BCP 47 tags used for Intl date formatting.
export const INTL_LOCALES: Record<Locale, string> = {
  nl: "nl-NL",
  en: "en-GB",
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (LOCALES as readonly string[]).includes(value);
