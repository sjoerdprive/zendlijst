import Link from "next/link";
import { SubscribeForm } from "@/features/subscribe";
import { getDictionary } from "@/shared/i18n/server";
import { Card } from "@/shared/ui";
import { ClosedNotice } from "./ClosedNotice";
import type { OrganisationIntroProps } from "./types";

export const AnonymousHome = async ({ organisation }: OrganisationIntroProps) => {
  const t = await getDictionary();
  const mode = organisation.subscriptionMode;
  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div className="space-y-3 text-center">
        <p className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-ink">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
          {t.tenantHome.eyebrow}
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{organisation.name}</h1>
        {mode !== "closed" && (
          <p className="text-muted">{mode === "approval" ? t.tenantHome.introApproval : t.tenantHome.intro}</p>
        )}
      </div>
      {mode === "closed" ? (
        <ClosedNotice organisation={organisation} />
      ) : (
        <Card className="border-t-4 border-t-brand">
          <SubscribeForm requiresApproval={mode === "approval"} />
        </Card>
      )}
      <p className="text-center text-sm text-muted">
        {t.tenantHome.alreadySubscribed}{" "}
        <Link href="/sign-in" className="font-semibold text-brand underline decoration-accent decoration-2 underline-offset-4">
          {t.tenantHome.signIn}
        </Link>
      </p>
    </div>
  );
};
