import { z } from "zod";

// Takes the (localised) error message so actions can report it in the visitor's language.
export const emailSchema = (message: string) => z.email({ message }).trim().toLowerCase().max(254);

// Flattens zod issues into { field: [messages] } for form display.
export const fieldErrors = (error: z.ZodError): Record<string, string[]> =>
  z.flattenError(error).fieldErrors as Record<string, string[]>;
