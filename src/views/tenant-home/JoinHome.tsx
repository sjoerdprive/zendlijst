import { hasSubscriptionRequest } from "@/entities/membership/server";
import { JoinAsSignedInUser } from "@/features/subscribe";
import { getDictionary } from "@/shared/i18n/server";
import { Card, Notice } from "@/shared/ui";
import { ClosedNotice } from "./ClosedNotice";
import type { JoinHomeProps } from "./types";

export const JoinHome = async ({ organisation, userId }: JoinHomeProps) => {
  const [t, pending] = await Promise.all([getDictionary(), hasSubscriptionRequest(organisation.id, userId)]);
  const mode = organisation.subscriptionMode;

  if (pending) {
    return (
      <div className="mx-auto max-w-xl">
        <Notice tone="info" title={t.tenantHome.pendingTitle}>
          {t.tenantHome.pendingBody}
        </Notice>
      </div>
    );
  }
  if (mode === "closed") {
    return (
      <div className="mx-auto max-w-xl">
        <ClosedNotice organisation={organisation} />
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-xl">
      <Card
        title={t.tenantHome.joinTitle(organisation.name)}
        description={mode === "approval" ? t.tenantHome.joinApprovalDescription : t.tenantHome.joinDescription}
        className="border-t-4 border-t-brand"
      >
        <JoinAsSignedInUser requiresApproval={mode === "approval"} />
      </Card>
    </div>
  );
};
