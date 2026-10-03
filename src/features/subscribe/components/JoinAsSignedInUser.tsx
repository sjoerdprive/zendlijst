import { SubmitButton } from "@/shared/ui";
import { subscribeSignedInAction } from "../actions";

export const JoinAsSignedInUser = () => (
  <form action={subscribeSignedInAction} className="space-y-4">
    <label className="flex items-start gap-2 text-sm">
      <input type="checkbox" name="notify" defaultChecked className="mt-0.5 size-4 rounded border-zinc-300" />
      <span>Email me each new issue when it is published</span>
    </label>
    <SubmitButton pendingLabel="Subscribing…">Subscribe</SubmitButton>
  </form>
);
