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
import type { Dictionary } from "@/shared/i18n";
import { getDictionary } from "@/shared/i18n/server";
import { actionError, actionSuccess, fieldErrors, type ActionState } from "@/shared/lib";

const authorizeTeam = async () => {
  const organisation = await requireCurrentOrganisation();
  const member = await authorizeMember(organisation.id, ["admin", "writer"]);
  return member ? { organisation, member } : null;
};

const scheduleSchema = (t: Dictionary) =>
  z
    .union([z.literal(""), z.iso.datetime()])
    .transform((value) => (value ? new Date(value) : null))
    .refine((date) => !date || date.getTime() > Date.now() - 60_000, t.newsletters.futureMoment);

const uploadSchema = (t: Dictionary) =>
  z.object({
    title: z.string().trim().min(2, t.newsletters.titleRequired).max(200),
    summary: z.string().trim().max(500).optional(),
    scheduledAt: scheduleSchema(t),
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
    scheduledAt: formData.get("scheduledAt") ?? "",
    mode: formData.get("mode"),
  });
  if (!parsed.success) return actionError(t.common.checkForm, fieldErrors(parsed.error));

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return actionError(t.newsletters.chooseFile, { file: [t.newsletters.chooseFile] });
  }
  const contentType = contentTypeForFileName(file.name);
  if (!contentType) {
    return actionError(t.newsletters.unsupportedType, { file: [t.newsletters.useHtmlOrPdf] });
  }
  if (file.size > MAX_NEWSLETTER_BYTES) {
    return actionError(t.newsletters.tooLarge, { file: [t.newsletters.maxSize] });
  }

  const { title, summary, mode } = parsed.data;
  const scheduledAt = mode === "now" ? new Date() : mode === "schedule" ? parsed.data.scheduledAt : null;
  if (mode === "schedule" && !scheduledAt) {
    return actionError(t.newsletters.pickDateTime, { scheduledAt: [t.newsletters.pickDateTime] });
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

  if (mode === "now") return actionSuccess(t.newsletters.sendingStarted);
  if (mode === "draft") return actionSuccess(t.newsletters.savedDraft);
  return actionSuccess(t.newsletters.scheduled);
};

const rescheduleSchema = (t: Dictionary) =>
  z.object({
    newsletterId: z.string().min(1),
    scheduledAt: scheduleSchema(t),
  });

export const rescheduleNewsletterAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const context = await authorizeTeam();
  const t = await getDictionary();
  if (!context) return actionError(t.common.notAllowed);
  const parsed = rescheduleSchema(t).safeParse({
    newsletterId: formData.get("newsletterId"),
    scheduledAt: formData.get("scheduledAt") ?? "",
  });
  if (!parsed.success) return actionError(t.newsletters.futureMoment);
  const updated = await setNewsletterSchedule(
    context.organisation.id,
    parsed.data.newsletterId,
    parsed.data.scheduledAt,
  );
  refresh();
  if (!updated) return actionError(t.newsletters.alreadySending);
  return actionSuccess(parsed.data.scheduledAt ? t.newsletters.scheduleUpdated : t.newsletters.movedToDrafts);
};

export const deleteNewsletterAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const context = await authorizeTeam();
  const t = await getDictionary();
  if (!context) return actionError(t.common.notAllowed);
  const deleted = await deleteNewsletter(context.organisation.id, String(formData.get("newsletterId") ?? ""));
  refresh();
  return deleted ? actionSuccess(t.newsletters.deleted) : actionError(t.newsletters.cannotDeleteSent);
};
