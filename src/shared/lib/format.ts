import { INTL_LOCALES, type Locale } from "@/shared/i18n";

// Everything is shown in Dutch time, whatever the server's or browser's zone.
export const APP_TIME_ZONE = "Europe/Amsterdam";

const formatters = new Map<string, Intl.DateTimeFormat>();

const formatterFor = (locale: Locale, options: Intl.DateTimeFormatOptions) => {
  const key = `${locale}:${JSON.stringify(options)}`;
  const existing = formatters.get(key);
  if (existing) return existing;
  const created = new Intl.DateTimeFormat(INTL_LOCALES[locale], { ...options, timeZone: APP_TIME_ZONE });
  formatters.set(key, created);
  return created;
};

export const formatDateTime = (value: Date, locale: Locale): string =>
  formatterFor(locale, { dateStyle: "medium", timeStyle: "short" }).format(value);

export const formatDate = (value: Date, locale: Locale): string =>
  formatterFor(locale, { dateStyle: "long" }).format(value);

// e.g. "zaterdag 10 oktober 2026"
export const formatWeekdayDate = (value: Date, locale: Locale): string =>
  formatterFor(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(value);
