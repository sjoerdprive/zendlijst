"use client";

import { createContext } from "react";
import { DEFAULT_LOCALE, type Locale } from "./config";

export const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);
