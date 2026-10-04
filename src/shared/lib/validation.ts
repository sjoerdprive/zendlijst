import { z } from "zod";

// Takes the (localised) error message so actions can report it in the visitor's language.
export const emailSchema = (message: string) => z.email({ message }).trim().toLowerCase().max(254);

// Flattens zod issues into { field: [messages] } for form display.
export const fieldErrors = (error: z.ZodError): Record<string, string[]> =>
  z.flattenError(error).fieldErrors as Record<string, string[]>;

// Normalises a typed or pasted one-time code; null unless exactly six digits.
export const parseOneTimeCode = (value: FormDataEntryValue | null): string | null => {
  const digits = String(value ?? "").replace(/\s+/g, "");
  return /^\d{6}$/.test(digits) ? digits : null;
};
