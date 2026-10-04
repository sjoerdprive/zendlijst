import Link from "next/link";
import { getDictionary } from "@/shared/i18n/server";

export const SiteFooter = async () => {
  const t = await getDictionary();
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-muted sm:px-6">
        <p>
          <span className="font-display font-semibold text-ink">
            {t.meta.title}
            <span aria-hidden="true" className="text-accent">
              .
            </span>
          </span>{" "}
          · {t.footer.tagline}
        </p>
        <Link href="/privacy" className="font-medium hover:text-brand hover:underline">
          {t.footer.privacy}
        </Link>
      </div>
    </footer>
  );
};
