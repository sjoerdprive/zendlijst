"use server";

import { refresh } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { authorizeMember } from "@/entities/membership/server";
import { describeDelivery, describeUploadProblem, scheduleDateSchema } from "@/entities/newsletter";
import { createNewsletter, readNewsletterUpload } from "@/entities/newsletter/server";
import { linkWaitingNotesToDraft } from "@/entities/note/server";
import { requireCurrentOrganisation } from "@/entities/organisation/server";
import type { Dictionary } from "@/shared/i18n";
import { getDictionary, getLocale } from "@/shared/i18n/server";
import { actionError, actionSuccess, fieldErrors, type ActionState } from "@/shared/lib";
import { triggerDispatch } from "@/shared/lib/server";

const authorizeTeam = async () => {
  const organisation = await requireCurrentOrganisation();
  const member = await authorizeMember(organisation.id, ["admin", "writer"]);
  return member ? { organisation, member } : null;
};

// Only a date is chosen; delivery is always at the fixed morning moment (Dutch time).
const uploadSchema = (t: Dictionary) =>
  z.object({
    title: z.string().trim().min(2, t.newsletters.titleRequired).max(200),
    summary: z.string().trim().max(500).optional(),
    scheduledAt: scheduleDateSchema(t),
    mode: z.enum(["schedule", "now", "draft"]),
  });

export const uploadNewsletterAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const context = await authorizeTeam();
  const t = await getDictionary();
  if (!context) return actionError(t.newsletters.notAllowedUpload);

  const parsed = uploadSchema(t).safeParse({
    title: formData.get("title"),
    summary: formData.get("summary") || undefined,
    scheduledAt: formData.get("scheduledDate") ?? "",
    mode: formData.get("mode"),
  });
  if (!parsed.success) return actionError(t.common.checkForm, fieldErrors(parsed.error));

  const upload = await readNewsletterUpload(formData.get("file"));
  if (!upload.ok) {
    const { message, field } = describeUploadProblem(upload.problem, t);
    return actionError(message, { file: [field] });
  }

  const { title, summary, mode } = parsed.data;
  const scheduledAt = mode === "now" ? new Date() : mode === "schedule" ? parsed.data.scheduledAt : null;
  if (mode === "schedule" && !scheduledAt) {
    return actionError(t.newsletters.pickDateTime, { scheduledDate: [t.newsletters.pickDateTime] });
  }

  const newsletterId = await createNewsletter({
    organisationId: context.organisation.id,
    title,
    summary: summary ?? null,
    ...upload.file,
    scheduledAt,
    createdById: context.member.userId,
  });
  // A new draft or scheduled issue picks up notes waiting for the next one;
  // an issue that goes out right away has no use for them.
  if (mode !== "now") await linkWaitingNotesToDraft(context.organisation.id, newsletterId);
  refresh();

  if (mode === "now") {
    after(triggerDispatch);
    return actionSuccess(t.newsletters.sendingStarted);
  }
  if (mode === "draft" || !scheduledAt) return actionSuccess(t.newsletters.savedDraft);
  return actionSuccess(t.newsletters.scheduledFor(describeDelivery(scheduledAt, t, await getLocale())));
};
