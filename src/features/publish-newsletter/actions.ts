"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { authorizeMember } from "@/entities/membership/server";
import {
  contentTypeForFileName,
  MAX_NEWSLETTER_BYTES,
} from "@/entities/newsletter";
import {
  createNewsletter,
  deleteNewsletter,
  setNewsletterSchedule,
} from "@/entities/newsletter/server";
import { requireCurrentOrganisation } from "@/entities/organisation/server";
import { actionError, actionSuccess, fieldErrors, type ActionState } from "@/shared/lib";

const authorizeTeam = async () => {
  const organisation = await requireCurrentOrganisation();
  const member = await authorizeMember(organisation.id, ["admin", "writer"]);
  return member ? { organisation, member } : null;
};

const scheduleSchema = z
  .union([z.literal(""), z.iso.datetime()])
  .transform((value) => (value ? new Date(value) : null))
  .refine((date) => !date || date.getTime() > Date.now() - 60_000, "Pick a moment in the future.");

const uploadSchema = z.object({
  title: z.string().trim().min(2, "Give the newsletter a title.").max(200),
  summary: z.string().trim().max(500).optional(),
  scheduledAt: scheduleSchema,
  mode: z.enum(["schedule", "now", "draft"]),
});

export const uploadNewsletterAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const context = await authorizeTeam();
  if (!context) return actionError("Only admins and writers can upload newsletters.");

  const parsed = uploadSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary") || undefined,
    scheduledAt: formData.get("scheduledAt") ?? "",
    mode: formData.get("mode"),
  });
  if (!parsed.success) return actionError("Please check the form.", fieldErrors(parsed.error));

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return actionError("Choose a file to upload.", { file: ["Choose a file to upload."] });
  }
  const contentType = contentTypeForFileName(file.name);
  if (!contentType) return actionError("Only HTML and PDF files are supported.", { file: ["Use .html or .pdf"] });
  if (file.size > MAX_NEWSLETTER_BYTES) return actionError("The file is larger than 8 MB.", { file: ["Max 8 MB"] });

  const { title, summary, mode } = parsed.data;
  const scheduledAt = mode === "now" ? new Date() : mode === "schedule" ? parsed.data.scheduledAt : null;
  if (mode === "schedule" && !scheduledAt) {
    return actionError("Pick a date and time.", { scheduledAt: ["Pick a date and time."] });
  }

  await createNewsletter({
    organisationId: context.organisation.id,
    title,
    summary: summary ?? null,
    fileName: file.name,
    contentType,
    content: Buffer.from(await file.arrayBuffer()),
    scheduledAt,
    createdById: context.member.userId,
  });
  refresh();

  if (mode === "now") return actionSuccess("Sending has started. It goes out within a minute.");
  if (mode === "draft") return actionSuccess("Saved as draft.");
  return actionSuccess("Newsletter scheduled.");
};

const rescheduleSchema = z.object({
  newsletterId: z.string().min(1),
  scheduledAt: scheduleSchema,
});

export const rescheduleNewsletterAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const context = await authorizeTeam();
  if (!context) return actionError("Not allowed.");
  const parsed = rescheduleSchema.safeParse({
    newsletterId: formData.get("newsletterId"),
    scheduledAt: formData.get("scheduledAt") ?? "",
  });
  if (!parsed.success) return actionError("Pick a moment in the future.");
  const updated = await setNewsletterSchedule(
    context.organisation.id,
    parsed.data.newsletterId,
    parsed.data.scheduledAt,
  );
  refresh();
  if (!updated) return actionError("This newsletter is already being sent.");
  return actionSuccess(parsed.data.scheduledAt ? "Schedule updated." : "Moved back to drafts.");
};

export const deleteNewsletterAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const context = await authorizeTeam();
  if (!context) return actionError("Not allowed.");
  const deleted = await deleteNewsletter(context.organisation.id, String(formData.get("newsletterId") ?? ""));
  refresh();
  return deleted ? actionSuccess("Newsletter deleted.") : actionError("Sent newsletters cannot be deleted.");
};
