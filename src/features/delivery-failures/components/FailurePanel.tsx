import { getDictionary } from "@/shared/i18n/server";
import { Notice } from "@/shared/ui";
import type { FailedDelivery } from "@/entities/delivery";
import type { FailurePanelProps } from "../types";
import { FailureGroup } from "./FailureGroup";

const groupByNewsletter = (failures: FailedDelivery[]) => {
  const groups = new Map<string, FailedDelivery[]>();
  for (const failure of failures) {
    groups.set(failure.newsletterId, [...(groups.get(failure.newsletterId) ?? []), failure]);
  }
  return [...groups.entries()];
};

// Always visible on the team dashboard while failures are unresolved, so the
// team is informed even if the alert email itself could not be delivered.
export const FailurePanel = async ({ failures }: FailurePanelProps) => {
  if (failures.length === 0) return null;
  const t = await getDictionary();
  return (
    <section className="space-y-3">
      <Notice tone="danger" title={t.failures.title}>
        {t.failures.body}
      </Notice>
      {groupByNewsletter(failures).map(([newsletterId, group]) => (
        <FailureGroup
          key={newsletterId}
          newsletterId={newsletterId}
          newsletterTitle={group[0]?.newsletterTitle ?? t.failures.fallbackTitle}
          failures={group}
        />
      ))}
    </section>
  );
};
