import { INTL_LOCALES, type Locale } from "@/shared/i18n";

const dateTimeFormats = new Map<Locale, Intl.DateTimeFormat>();
const dateFormats = new Map<Locale, Intl.DateTimeFormat>();

const formatterFor = (cache: Map<Locale, Intl.DateTimeFormat>, locale: Locale, options: Intl.DateTimeFormatOptions) => {
  const existing = cache.get(locale);
  if (existing) return existing;
  const created = new Intl.DateTimeFormat(INTL_LOCALES[locale], options);
  cache.set(locale, created);
  return created;
};

export const formatDateTime = (value: Date, locale: Locale): string =>
  formatterFor(dateTimeFormats, locale, { dateStyle: "medium", timeStyle: "short" }).format(value);

export const formatDate = (value: Date, locale: Locale): string =>
  formatterFor(dateFormats, locale, { dateStyle: "long" }).format(value);
