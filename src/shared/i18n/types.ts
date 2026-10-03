import type { ReactNode } from "react";
import type { nl } from "./dictionaries/nl";
import type { Locale } from "./config";

export type Dictionary = typeof nl;

export interface I18nProviderProps {
  locale: Locale;
  children: ReactNode;
}
