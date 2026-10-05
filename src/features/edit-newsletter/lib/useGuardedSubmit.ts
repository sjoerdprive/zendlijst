"use client";

import { useRef, type FormEvent } from "react";

/*
 * Runs `before` (e.g. saving pending edits) and an optional confirmation
 * before a form is submitted, then submits it again with the same button so
 * its name/value still reach the server action.
 */
export const useGuardedSubmit = (
  before: (submitter: HTMLButtonElement | null) => Promise<boolean>,
  confirmFor?: (submitter: HTMLButtonElement | null) => string | null,
) => {
  const passRef = useRef(false);
  return (event: FormEvent<HTMLFormElement>) => {
    if (passRef.current) {
      passRef.current = false;
      return;
    }
    event.preventDefault();
    const form = event.currentTarget;
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const question = confirmFor?.(submitter);
    if (question && !window.confirm(question)) return;
    void before(submitter).then((ok) => {
      if (!ok) return;
      passRef.current = true;
      form.requestSubmit(submitter ?? undefined);
    });
  };
};
