"use client";

import { useState } from "react";
import { useDictionary } from "@/shared/i18n";
import type { PendingSubscription, SubscribeFormProps } from "../types";
import { SubscribeCodeForm } from "./SubscribeCodeForm";
import { SubscribeEmailForm } from "./SubscribeEmailForm";

// Step 1 sends the confirmation email; step 2 accepts its code, so the
// subscription can be confirmed without leaving the installed app.
export const SubscribeForm = ({ requiresApproval }: SubscribeFormProps) => {
  const t = useDictionary();
  const [pending, setPending] = useState<PendingSubscription | null>(null);
  if (!pending) return <SubscribeEmailForm requiresApproval={requiresApproval} onSent={setPending} />;
  return (
    <SubscribeCodeForm
      pending={pending}
      message={requiresApproval ? t.subscribe.successApproval : t.subscribe.success}
      onBack={() => setPending(null)}
    />
  );
};
