import { z } from "zod";

export const emailSchema = z
  .email({ message: "Enter a valid email address." })
  .trim()
  .toLowerCase()
  .max(254);

// Flattens zod issues into { field: [messages] } for form display.
export const fieldErrors = (error: z.ZodError): Record<string, string[]> =>
  z.flattenError(error).fieldErrors as Record<string, string[]>;
