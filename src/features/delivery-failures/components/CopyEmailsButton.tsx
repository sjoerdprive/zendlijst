"use client";

import { useState } from "react";
import { useDictionary } from "@/shared/i18n";
import { Button } from "@/shared/ui";
import type { CopyEmailsButtonProps } from "../types";

export const CopyEmailsButton = ({ emails }: CopyEmailsButtonProps) => {
  const t = useDictionary();
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="secondary"
      onClick={async () => {
        await navigator.clipboard.writeText(emails.join(", "));
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? t.failures.copied : t.failures.copy}
    </Button>
  );
};
