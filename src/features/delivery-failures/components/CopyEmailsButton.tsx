"use client";

import { useState } from "react";
import { Button } from "@/shared/ui";
import type { CopyEmailsButtonProps } from "../types";

export const CopyEmailsButton = ({ emails }: CopyEmailsButtonProps) => {
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
      {copied ? "Copied!" : "Copy addresses"}
    </Button>
  );
};
