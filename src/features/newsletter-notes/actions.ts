"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { authorizeMember } from "@/entities/membership/server";
import { isEditable } from "@/entities/newsletter";
import { getNewsletter } from "@/entities/newsletter/server";
import type { NoteTarget } from "@/entities/note";
import {
  archiveNote,
  archiveNotes,
  createNote,
  deleteNote,
  deleteNotes,
  moveNotes,
  restoreNote,
  setNoteDone,
} from "@/entities/note/server";
import { requireCurrentOrganisation } from "@/entities/organisation/server";
import { getDictionary } from "@/shared/i18n/server";
import { actionError, actionSuccess, type ActionState } from "@/shared/lib";
import { nextNoteTarget } from "./target";

const authorizeTeam = async () => {
  const organisation = await requireCurrentOrganisation();
  const member = await authorizeMember(organisation.id, ["admin", "writer"]);
  return member ? { organisation, member } : null;
};

// "next" (default) · "general" · "newsletter:<id>"
const noteSchema = z.object({
  body: z.string().trim().min(1).max(2000),
  target: z.string().max(100).default("next"),
});

const resolveTarget = async (organisationId: string, target: string): Promise<NoteTarget> => {
  if (target === "general") return { general: true };
  if (target.startsWith("newsletter:")) {
    // Only link to this organisation's drafts and scheduled issues.
    const linked = await getNewsletter(organisationId, target.slice("newsletter:".length));
    if (linked && isEditable(linked.status)) return { newsletterId: linked.id };
  }
  return nextNoteTarget(organisationId);
};

export const addNoteAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const context = await authorizeTeam();
  const t = await getDictionary();
  if (!context) return actionError(t.common.notAllowed);
  const parsed = noteSchema.safeParse({
    body: formData.get("body"),
    target: formData.get("target") || undefined,
  });
  if (!parsed.success) return actionError(t.notes.writeSomething);

  const target = await resolveTarget(context.organisation.id, parsed.data.target);
  await createNote({
    organisationId: context.organisation.id,
    authorId: context.member.userId,
    body: parsed.data.body,
    newsletterId: "newsletterId" in target ? target.newsletterId : null,
    forNextDraft: "forNextDraft" in target,
  });
  refresh();
  return actionSuccess(t.notes.added);
};

export const toggleNoteAction = async (formData: FormData): Promise<void> => {
  const context = await authorizeTeam();
  if (!context) return;
  await setNoteDone(context.organisation.id, String(formData.get("noteId")), formData.get("done") === "true");
  refresh();
};

export const deleteNoteAction = async (formData: FormData): Promise<void> => {
  const context = await authorizeTeam();
  if (!context) return;
  await deleteNote(context.organisation.id, String(formData.get("noteId")));
  refresh();
};

export const archiveNoteAction = async (formData: FormData): Promise<void> => {
  const context = await authorizeTeam();
  if (!context) return;
  await archiveNote(context.organisation.id, String(formData.get("noteId")));
  refresh();
};

export const restoreNoteAction = async (formData: FormData): Promise<void> => {
  const context = await authorizeTeam();
  if (!context) return;
  await restoreNote(context.organisation.id, String(formData.get("noteId")));
  refresh();
};

const decisionSchema = z.object({
  newsletterId: z.string().min(1),
  noteId: z.string().min(1).optional(),
  decision: z.enum(["archive", "delete", "move"]),
});

// What happens to a sent newsletter's notes: all of them, or one (noteId).
export const decideNotesAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const context = await authorizeTeam();
  const t = await getDictionary();
  if (!context) return actionError(t.common.notAllowed);
  const parsed = decisionSchema.safeParse({
    newsletterId: formData.get("newsletterId"),
    noteId: formData.get("noteId") || undefined,
    decision: formData.get("decision"),
  });
  if (!parsed.success) return actionError(t.common.checkForm);

  const { newsletterId, noteId, decision } = parsed.data;
  const organisationId = context.organisation.id;
  const selection = { newsletterId, noteId };
  if (decision === "archive") {
    await archiveNotes(organisationId, selection);
  } else if (decision === "delete") {
    await deleteNotes(organisationId, selection);
  } else {
    await moveNotes(organisationId, selection, await nextNoteTarget(organisationId));
  }
  refresh();
  const done = t.notes.afterSend;
  return actionSuccess(decision === "archive" ? done.archived : decision === "delete" ? done.deleted : done.moved);
};
