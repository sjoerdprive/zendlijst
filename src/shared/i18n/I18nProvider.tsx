"use client";

import { LocaleContext } from "./context";
import type { I18nProviderProps } from "./types";

// Only the locale crosses the server/client boundary; dictionaries contain
// functions, so client components look them up locally.
export const I18nProvider = ({ locale, children }: I18nProviderProps) => (
  <LocaleContext value={locale}>{children}</LocaleContext>
);
