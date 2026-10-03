"use client";

import { useEffect, useRef } from "react";
import { Input } from "./inputs";
import type { DateTimeInputProps } from "./types";

const toLocalInputValue = (iso: string | undefined): string => {
  if (!iso) return "";
  const date = new Date(iso);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

/*
 * `datetime-local` has no time zone, so the browser converts the picked moment
 * to an ISO string and submits that under `name`. Uncontrolled on purpose:
 * it follows native form resets (React resets forms after successful actions).
 */
export const DateTimeInput = ({ id, name, defaultValue, required, min }: DateTimeInputProps) => {
  const visibleRef = useRef<HTMLInputElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const form = visibleRef.current?.form;
    if (!form) return;
    const onReset = () => {
      if (hiddenRef.current) hiddenRef.current.value = defaultValue ?? "";
    };
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, [defaultValue]);

  return (
    <>
      <Input
        ref={visibleRef}
        id={id}
        type="datetime-local"
        required={required}
        min={min ? toLocalInputValue(min) : undefined}
        defaultValue={toLocalInputValue(defaultValue)}
        onChange={(event) => {
          const value = event.target.value;
          if (hiddenRef.current) hiddenRef.current.value = value ? new Date(value).toISOString() : "";
        }}
      />
      <input ref={hiddenRef} type="hidden" name={name} defaultValue={defaultValue ?? ""} />
    </>
  );
};
