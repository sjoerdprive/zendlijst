import { getDictionary } from "@/shared/i18n/server";
import { PageContainer } from "@/shared/ui";

// Shared by the platform and every organisation subdomain (/privacy).
export const LegalView = async () => {
  const t = await getDictionary();
  const { legal } = t;
  return (
    <PageContainer width="narrow">
      <article className="space-y-10">
        <header className="space-y-3">
          <h1 className="font-display text-4xl font-semibold tracking-tight">{legal.title}</h1>
          <p className="text-lg text-muted">{legal.intro}</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-ink">{legal.updated}</p>
        </header>
        <nav aria-label={legal.contents} className="rounded-2xl border border-line bg-surface p-5">
          <p className="mb-2 text-sm font-semibold">{legal.contents}</p>
          <ol className="grid gap-1 text-sm sm:grid-cols-2">
            {legal.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-brand hover:underline">
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        {legal.sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24 space-y-3">
            <h2 className="font-display text-2xl font-semibold tracking-tight">{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
            {section.items.length > 0 && (
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3 leading-relaxed">
                    <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>
    </PageContainer>
  );
};
