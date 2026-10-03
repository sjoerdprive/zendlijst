"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./Button";
import type { SubmitButtonProps } from "./types";

export const SubmitButton = ({ children, pendingLabel, disabled, ...props }: SubmitButtonProps) => {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} aria-busy={pending} {...props}>
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
};
