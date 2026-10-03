import { RequestOrganisationForm } from "@/features/request-organisation";
import { getEnv } from "@/shared/config";
import { getDictionary } from "@/shared/i18n/server";
import { cn } from "@/shared/lib";
import { Card, PageContainer } from "@/shared/ui";

// Cycles through the palette so each feature gets its own marker colour.
const MARKER_CLASSES = ["bg-brand text-on-brand", "bg-accent text-white dark:text-zinc-950", "bg-brand-soft text-brand"];

export const PlatformHomeView = async () => {
  const t = await getDictionary();
  return (
    <PageContainer>
      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <section className="space-y-8">
          <div className="space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-ink">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
              {t.platformHome.eyebrow}
            </p>
            <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              {t.platformHome.heading}
            </h1>
            <p className="text-lg text-muted">{t.platformHome.intro}</p>
          </div>
          <ul className="space-y-5">
            {t.platformHome.features.map((feature, index) => (
              <li key={feature.title} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-xl font-display text-sm font-semibold",
                    MARKER_CLASSES[index % MARKER_CLASSES.length],
                  )}
                >
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold">{feature.title}</p>
                  <p className="text-sm text-muted">{feature.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <Card
          title={t.platformHome.requestTitle}
          description={t.platformHome.requestDescription}
          className="border-t-4 border-t-accent"
        >
          <RequestOrganisationForm rootDomain={getEnv().APP_ROOT_DOMAIN} />
        </Card>
      </div>
    </PageContainer>
  );
};
