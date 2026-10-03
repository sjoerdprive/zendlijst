"use client";

import { cn } from "@/shared/lib";
import { LOCALES, useDictionary, useLocale } from "@/shared/i18n";
import { setLocaleAction } from "../actions";

export const LocaleSwitcher = () => {
  const current = useLocale();
  const t = useDictionary();
  return (
    <form action={setLocaleAction} aria-label={t.locale.label} className="flex rounded-full border border-line bg-surface p-0.5 text-xs font-semibold">
      {LOCALES.map((locale) => {
        const active = locale === current;
        return (
          <button
            key={locale}
            type="submit"
            name="locale"
            value={locale}
            lang={locale}
            title={t.locale.names[locale]}
            aria-pressed={active}
            className={cn(
              "rounded-full px-2.5 py-1 uppercase tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              active ? "bg-brand text-on-brand" : "text-muted hover:text-ink",
            )}
          >
            <span className="sr-only">{t.locale.names[locale]}</span>
            <span aria-hidden="true">{locale}</span>
          </button>
        );
      })}
    </form>
  );
};
