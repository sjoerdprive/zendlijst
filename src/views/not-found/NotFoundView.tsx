import Link from "next/link";
import { getDictionary } from "@/shared/i18n/server";
import { buttonClasses, PageContainer } from "@/shared/ui";

export const NotFoundView = async () => {
  const t = await getDictionary();
  return (
    <PageContainer width="narrow">
      <div className="space-y-4 text-center">
        <p aria-hidden="true" className="font-display text-7xl font-semibold text-brand">
          404<span className="text-accent">.</span>
        </p>
        <h1 className="font-display text-2xl font-semibold">{t.notFound.title}</h1>
        <p className="text-muted">{t.notFound.body}</p>
        <Link href="/" className={buttonClasses("primary")}>
          {t.notFound.home}
        </Link>
      </div>
    </PageContainer>
  );
};
