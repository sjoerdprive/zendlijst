"use server";

import { refresh } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { authorizeMember } from "@/entities/membership/server";
import {
  describeDelivery,
  describeUploadProblem,
  hasEditorContent,
  isEditable,
  parseEditorDocument,
  scheduleDateSchema,
} from "@/entities/newsletter";
import {
  attachNewsletterFile,
  clearNewsletterContent,
  createEmptyDraft,
  deleteNewsletter,
  getNewsletterDraft,
  readNewsletterUpload,
  renderNewsletterHtml,
  saveNewsletterDetails,
  saveNewsletterDraft,
  setNewsletterSchedule,
} from "@/entities/newsletter/server";
import { linkWaitingNotesToDraft } from "@/entities/note/server";
import { requireCurrentOrganisation } from "@/entities/organisation/server";
import { getDictionary, getLocale } from "@/shared/i18n/server";
import { actionError, actionRedirect, actionSuccess, type ActionState } from "@/shared/lib";
import { triggerDispatch } from "@/shared/lib/server";
import type { SaveDraftInput, SaveDraftResponse } from "./types";

const authorizeTeam = async () => {
  const organisation = await requireCurrentOrganisation();
  const member = await authorizeMember(organisation.id, ["admin", "writer"]);
  return member ? { organisation, member } : null;
};

const editPath = (newsletterId: string) => `/team/newsletters/${newsletterId}`;

// An empty draft, saved straight away; it picks up notes waiting for the next draft.
export const createDraftAction = async (): Promise<ActionState> => {
  const context = await authorizeTeam();
  const t = await getDictionary();
  if (!context) return actionError(t.common.notAllowed);
  const draftId = await createEmptyDraft(context.organisation.id, context.member.userId);
  await linkWaitingNotesToDraft(context.organisation.id, draftId);
  return actionRedirect(editPath(draftId));
};

const saveSchema = z.object({
  newsletterId: z.string().min(1),
  version: z.number().int().min(0),
  title: z.string().trim().max(200),
  summary: z.string().trim().max(500),
  body: z.string().nullable(),
});

// Autosave. Refuses to overwrite a newer version (someone else saved in between).
export const saveDraftAction = async (input: SaveDraftInput): Promise<SaveDraftResponse> => {
  const context = await authorizeTeam();
  const t = await getDictionary();
  if (!context) return { status: "error", message: t.common.notAllowed };
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) return { status: "error", message: t.editor.invalidContent };

  const { newsletterId, version, title, summary } = parsed.data;
  const organisation = context.organisation;
  const draft = await getNewsletterDraft(organisation.id, newsletterId);
  if (!draft || !isEditable(draft.status)) return { status: "locked" };
  const details = { title, summary: summary || null };

  // Uploaded files keep their content; only the details change.
  if (draft.source === "upload" || parsed.data.body === null) {
    if (draft.status === "scheduled" && !title) return { status: "error", message: t.editor.scheduledNeedsContent };
    const result = await saveNewsletterDetails(organisation.id, newsletterId, version, details);
    return result.status === "saved" ? { ...result, hasContent: draft.hasContent } : result;
  }

  const body = parseEditorDocument(parsed.data.body);
  if (!body) return { status: "error", message: t.editor.invalidContent };
  const content = hasEditorContent(body)
    ? Buffer.from(renderNewsletterHtml({ ...details, organisationName: organisation.name, body }), "utf8")
    : null;
  // A scheduled issue must stay sendable.
  if (draft.status === "scheduled" && (!title || !content)) {
    return { status: "error", message: t.editor.scheduledNeedsContent };
  }
  const result = await saveNewsletterDraft(organisation.id, newsletterId, version, { ...details, body, content });
  return result.status === "saved" ? { ...result, hasContent: content !== null } : result;
};

export const attachFileAction = async (_previous: ActionState, formData: FormData): Promise<ActionState> => {
  const context = await authorizeTeam();
  const t = await getDictionary();
  if (!context) return actionError(t.common.notAllowed);
  const newsletterId = String(formData.get("newsletterId") ?? "");

  const upload = await readNewsletterUpload(formData.get("file"));
  if (!upload.ok) {
    const { message, field } = describeUploadProblem(upload.problem, t);
    return actionError(message, { file: [field] });
  }
  const attached = await attachNewsletterFile(context.organisation.id, newsletterId, upload.file);
  if (!attached) return actionError(t.editor.locked);
  // The page switches from editor to file view: reload it.
  return actionRedirect(editPath(newsletterId));
};

export const clearFileAction = async (_previous: ActionState, formData: FormData): Promise<ActionState> => {
  const context = await authorizeTeam();
  const t = await getDictionary();
  if (!context) return actionError(t.common.notAllowed);
  const newsletterId = String(formData.get("newsletterId") ?? "");
  const cleared = await clearNewsletterContent(context.organisation.id, newsletterId);
  if (!cleared) return actionError(t.editor.removeFileOnlyDraft);
  return actionRedirect(editPath(newsletterId));
};

const sendSchema = z.object({
  newsletterId: z.string().min(1),
  intent: z.enum(["schedule", "now", "unschedule", "delete"]),
});

// Everything that changes a newsletter's place in the lifecycle.
export const sendNewsletterAction = async (_previous: ActionState, formData: FormData): Promise<ActionState> => {
  const context = await authorizeTeam();
  const t = await getDictionary();
  if (!context) return actionError(t.common.notAllowed);
  const parsed = sendSchema.safeParse({
    newsletterId: formData.get("newsletterId"),
    intent: formData.get("intent"),
  });
  if (!parsed.success) return actionError(t.common.checkForm);
  const { newsletterId, intent } = parsed.data;
  const organisationId = context.organisation.id;

  if (intent === "delete") {
    const deleted = await deleteNewsletter(organisationId, newsletterId);
    return deleted ? actionRedirect("/team/newsletters") : actionError(t.newsletters.cannotDeleteSent);
  }
  if (intent === "unschedule") {
    const result = await setNewsletterSchedule(organisationId, newsletterId, null);
    refresh();
    return result === "ok" ? actionSuccess(t.newsletters.movedToDrafts) : actionError(t.newsletters.alreadySending);
  }

  let scheduledAt = new Date();
  if (intent === "schedule") {
    const date = scheduleDateSchema(t).safeParse(formData.get("scheduledDate") ?? "");
    if (!date.success) return actionError(t.newsletters.futureMoment, { scheduledDate: [t.newsletters.futureMoment] });
    if (!date.data) return actionError(t.newsletters.pickDateTime, { scheduledDate: [t.newsletters.pickDateTime] });
    scheduledAt = date.data;
  }
  const result = await setNewsletterSchedule(organisationId, newsletterId, scheduledAt);
  if (result === "incomplete") return actionError(t.newsletters.incomplete);
  if (result === "locked") return actionError(t.newsletters.alreadySending);

  if (intent === "now") {
    // The dispatcher picks it up within a minute; the overview shows its progress.
    after(triggerDispatch);
    return actionRedirect("/team/newsletters?sending=1");
  }
  refresh();
  return actionSuccess(t.newsletters.scheduledFor(describeDelivery(scheduledAt, t, await getLocale())));
};
