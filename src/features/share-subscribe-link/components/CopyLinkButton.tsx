"use client";

import { useState } from "react";
import { useDictionary } from "@/shared/i18n";
import { Button } from "@/shared/ui";
import type { CopyLinkButtonProps } from "../types";

export const CopyLinkButton = ({ url }: CopyLinkButtonProps) => {
  const t = useDictionary();
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="secondary"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? t.share.copied : t.share.copy}
    </Button>
  );
};
