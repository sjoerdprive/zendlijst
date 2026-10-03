import type { Locale } from "../config";
import type { Dictionary } from "../types";
import { en } from "./en";
import { nl } from "./nl";

const DICTIONARIES: Record<Locale, Dictionary> = { nl, en };

export const getDictionaryFor = (locale: Locale): Dictionary => DICTIONARIES[locale];
