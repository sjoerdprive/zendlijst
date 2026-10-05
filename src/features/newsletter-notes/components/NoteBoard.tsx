import Link from "next/link";
import { isEditable, newsletterDisplayTitle, NewsletterStatusBadge } from "@/entities/newsletter";
import { NoteItem, type Note } from "@/entities/note";
import type { Dictionary } from "@/shared/i18n";
import { getDictionary } from "@/shared/i18n/server";
import { EmptyState } from "@/shared/ui";
import type { NoteBoardProps } from "../types";
import { NoteActions } from "./NoteActions";
import { NoteForm } from "./NoteForm";

interface NoteGroup {
  key: string;
  title: string;
  hint?: string;
  newsletterId?: string;
  status?: NonNullable<Note["newsletterStatus"]>;
  notes: Note[];
}

const STATUS_ORDER = { scheduled: 0, draft: 1, sending: 2, sent: 3 } as const;

// Waiting notes first, then per newsletter (scheduled before drafts before sent), then general ones.
const groupNotes = (notes: Note[], t: Dictionary): NoteGroup[] => {
  const groups = new Map<string, NoteGroup>();
  for (const note of notes) {
    const key = note.newsletterId ?? (note.forNextDraft ? "waiting" : "general");
    let group = groups.get(key);
    if (!group) {
      group =
        key === "waiting"
          ? { key, title: t.notes.groupWaiting, hint: t.notes.groupWaitingHint, notes: [] }
          : key === "general"
            ? { key, title: t.notes.general, notes: [] }
            : {
                key,
                title: newsletterDisplayTitle(note.newsletterTitle ?? "", t.newsletters.untitled),
                newsletterId: key,
                status: note.newsletterStatus ?? undefined,
                notes: [],
              };
      groups.set(key, group);
    }
    group.notes.push(note);
  }
  const rank = (group: NoteGroup) =>
    group.key === "waiting" ? -1 : group.key === "general" ? 10 : STATUS_ORDER[group.status ?? "sent"];
  return [...groups.values()].sort((a, b) => rank(a) - rank(b));
};

export const NoteBoard = async ({ notes, newsletters }: NoteBoardProps) => {
  const t = await getDictionary();
  const groups = groupNotes(notes, t);
  return (
    <div className="space-y-8">
      <NoteForm newsletters={newsletters} />
      {groups.length === 0 ? (
        <EmptyState title={t.notes.emptyTitle}>{t.notes.emptyBody}</EmptyState>
      ) : (
        groups.map((group) => (
          <section key={group.key} aria-labelledby={`notes-${group.key}`}>
            <header className="flex flex-wrap items-center gap-2 border-b border-line pb-2">
              <h3 id={`notes-${group.key}`} className="font-display font-semibold">
                {group.newsletterId && group.status && isEditable(group.status) ? (
                  <Link href={`/team/newsletters/${group.newsletterId}`} className="hover:text-brand hover:underline">
                    {group.title}
                  </Link>
                ) : (
                  group.title
                )}
              </h3>
              {group.status && <NewsletterStatusBadge status={group.status} />}
            </header>
            {group.hint && <p className="mt-2 text-xs text-muted">{group.hint}</p>}
            <ul className="divide-y divide-line">
              {group.notes.map((note) => (
                <NoteItem key={note.id} note={note} showNewsletter={false} actions={<NoteActions note={note} />} />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
};
