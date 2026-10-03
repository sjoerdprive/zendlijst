"use client";

import { useContext } from "react";
import type { Locale } from "./config";
import { LocaleContext } from "./context";
import { getDictionaryFor } from "./dictionaries";
import type { Dictionary } from "./types";

export const useLocale = (): Locale => useContext(LocaleContext);

export const useDictionary = (): Dictionary => getDictionaryFor(useLocale());
