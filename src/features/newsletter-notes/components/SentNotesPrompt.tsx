import type { SentNotesPromptProps } from "../types";
import { SentNotesDecision } from "./SentNotesDecision";

export const SentNotesPrompt = ({ groups }: SentNotesPromptProps) =>
  groups.length === 0 ? null : (
    <div className="space-y-3">
      {groups.map((group) => (
        <SentNotesDecision key={group.newsletterId} group={group} />
      ))}
    </div>
  );
