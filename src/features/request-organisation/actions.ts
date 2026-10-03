"use server";

import { z } from "zod";
import {
  createOrganisationRequest,
  isSlugAvailable,
} from "@/entities/organisation/server";
import { isValidSlug } from "@/entities/organisation";
import {
  actionError,
  actionSuccess,
  emailSchema,
  fieldErrors,
  type ActionState,
} from "@/shared/lib";
import { allowRequest } from "@/shared/lib/server";

const requestSchema = z.object({
  organisationName: z.string().trim().min(2, "Enter your organisation's name.").max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .refine(isValidSlug, "Use 3–32 lowercase letters, digits or dashes (no reserved names)."),
  adminEmail: emailSchema,
  message: z.string().trim().max(1000).optional(),
  // Honeypot: real users never fill this hidden field.
  website: z.string().max(0).optional(),
});

export const requestOrganisationAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const parsed = requestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return actionError("Please check the form.", fieldErrors(parsed.error));

  if (!(await allowRequest("organisation-request", undefined, { max: 3 }))) {
    return actionError("Too many requests. Please try again later.");
  }

  const { organisationName, slug, adminEmail, message } = parsed.data;
  if (!(await isSlugAvailable(slug))) {
    return actionError("That subdomain is already taken.", { slug: ["That subdomain is already taken."] });
  }

  await createOrganisationRequest({ organisationName, slug, adminEmail, message });
  return actionSuccess(
    "Thanks! We received your request. You'll get an email at the admin address once your newsletter space is ready.",
  );
};
