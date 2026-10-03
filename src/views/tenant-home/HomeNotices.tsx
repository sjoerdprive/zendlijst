import { Notice } from "@/shared/ui";
import type { HomeNoticesProps } from "./types";

export const HomeNotices = ({ flags }: HomeNoticesProps) => (
  <>
    {flags.welcome && <Notice tone="success">You are subscribed. Welcome!</Notice>}
    {flags.unsubscribed && <Notice tone="info">You have been unsubscribed.</Notice>}
    {flags.confirmFailed && (
      <Notice tone="warning">We could not confirm your subscription. Please request a new link.</Notice>
    )}
  </>
);
