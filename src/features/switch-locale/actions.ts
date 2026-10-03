"use server";

import { refresh } from "next/cache";
import { cookies } from "next/headers";
import { sharedCookieDomain } from "@/shared/config";
import { isLocale, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/shared/i18n";

export const setLocaleAction = async (formData: FormData): Promise<void> => {
  const locale = formData.get("locale");
  if (!isLocale(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
    domain: sharedCookieDomain(),
  });
  refresh();
};
