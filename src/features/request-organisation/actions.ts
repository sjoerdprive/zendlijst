"use server";

import { z } from "zod";
import {
  createOrganisationRequest,
  isSlugAvailable,
} from "@/entities/organisation/server";
import { isValidSlug } from "@/entities/organisation";
import type { Dictionary } from "@/shared/i18n";
import { getDictionary } from "@/shared/i18n/server";
import {
  actionError,
  actionSuccess,
  emailSchema,
  fieldErrors,
  type ActionState,
} from "@/shared/lib";
import { allowRequest } from "@/shared/lib/server";

const requestSchema = (t: Dictionary) =>
  z.object({
    organisationName: z.string().trim().min(2, t.requestOrganisation.nameRequired).max(100),
    slug: z.string().trim().toLowerCase().refine(isValidSlug, t.requestOrganisation.slugInvalid),
    adminEmail: emailSchema(t.common.invalidEmail),
    message: z.string().trim().max(1000).optional(),
    // Honeypot: real users never fill this hidden field.
    website: z.string().max(0).optional(),
  });

export const requestOrganisationAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const t = await getDictionary();
  const parsed = requestSchema(t).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return actionError(t.common.checkForm, fieldErrors(parsed.error));

  if (!(await allowRequest("organisation-request", undefined, { max: 3 }))) {
    return actionError(t.requestOrganisation.tooMany);
  }

  const { organisationName, slug, adminEmail, message } = parsed.data;
  if (!(await isSlugAvailable(slug))) {
    return actionError(t.requestOrganisation.slugTaken, { slug: [t.requestOrganisation.slugTaken] });
  }

  await createOrganisationRequest({ organisationName, slug, adminEmail, message });
  return actionSuccess(t.requestOrganisation.success);
};
