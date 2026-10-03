import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import { getDictionaryFor } from "./dictionaries";
import type { Dictionary } from "./types";

// The visitor's chosen language, falling back to Dutch. Works in server
// components, server actions and route handlers.
export const getLocale = cache(async (): Promise<Locale> => {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
});

export const getDictionary = async (): Promise<Dictionary> => getDictionaryFor(await getLocale());
