"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { authorizeMember } from "@/entities/membership/server";
import { getNewsletter } from "@/entities/newsletter/server";
import { createNote, deleteNote, setNoteDone } from "@/entities/note/server";
import { requireCurrentOrganisation } from "@/entities/organisation/server";
import { getDictionary } from "@/shared/i18n/server";
import { actionError, actionSuccess, type ActionState } from "@/shared/lib";

const authorizeTeam = async () => {
  const organisation = await requireCurrentOrganisation();
  const member = await authorizeMember(organisation.id, ["admin", "writer"]);
  return member ? { organisation, member } : null;
};

const noteSchema = z.object({
  body: z.string().trim().min(1).max(2000),
  newsletterId: z.string().optional(),
});

export const addNoteAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const context = await authorizeTeam();
  const t = await getDictionary();
  if (!context) return actionError(t.common.notAllowed);
  const parsed = noteSchema.safeParse({
    body: formData.get("body"),
    newsletterId: formData.get("newsletterId") || undefined,
  });
  if (!parsed.success) return actionError(t.notes.writeSomething);

  // Only link to newsletters of this organisation.
  const linked = parsed.data.newsletterId
    ? await getNewsletter(context.organisation.id, parsed.data.newsletterId)
    : null;

  await createNote({
    organisationId: context.organisation.id,
    authorId: context.member.userId,
    body: parsed.data.body,
    newsletterId: linked?.id ?? null,
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
