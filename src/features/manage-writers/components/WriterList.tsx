import { MAX_WRITERS, RoleBadge } from "@/entities/membership";
import { AddWriterForm } from "./AddWriterForm";
import { RemoveWriterButton } from "./RemoveWriterButton";
import type { WriterListProps } from "../types";

export const WriterList = ({ writers, admin }: WriterListProps) => (
  <div className="space-y-6">
    <ul className="divide-y divide-line">
      {admin && (
        <li className="flex items-center justify-between gap-4 py-3">
          <span className="break-all text-sm">{admin.email}</span>
          <RoleBadge role="admin" />
        </li>
      )}
      {writers.map((writer) => (
        <li key={writer.id} className="flex items-center justify-between gap-4 py-3">
          <span className="break-all text-sm">{writer.email}</span>
          <div className="flex items-center gap-2">
            <RoleBadge role="writer" />
            <RemoveWriterButton membershipId={writer.id} />
          </div>
        </li>
      ))}
    </ul>
    <AddWriterForm limitReached={writers.length >= MAX_WRITERS} />
  </div>
);
