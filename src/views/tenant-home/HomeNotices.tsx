import { getDictionary } from "@/shared/i18n/server";
import { Notice } from "@/shared/ui";
import type { HomeNoticesProps } from "./types";

export const HomeNotices = async ({ flags }: HomeNoticesProps) => {
  const t = await getDictionary();
  return (
    <>
      {flags.welcome && <Notice tone="success">{t.tenantHome.welcome}</Notice>}
      {flags.unsubscribed && <Notice tone="info">{t.tenantHome.unsubscribed}</Notice>}
      {flags.confirmFailed && <Notice tone="warning">{t.tenantHome.confirmFailed}</Notice>}
      {flags.requested && <Notice tone="info">{t.tenantHome.requested}</Notice>}
      {flags.closed && <Notice tone="warning">{t.subscribe.closed}</Notice>}
    </>
  );
};
