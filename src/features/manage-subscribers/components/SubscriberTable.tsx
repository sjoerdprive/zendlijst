"use client";

import { useMemo, useState } from "react";
import { RoleBadge } from "@/entities/membership";
import { useDictionary, useLocale } from "@/shared/i18n";
import { formatDate } from "@/shared/lib";
import { EmptyState, Input } from "@/shared/ui";
import type { SubscriberTableProps } from "../types";
import { RemoveSubscriberButton } from "./RemoveSubscriberButton";

// Emails are encrypted at rest, so search happens here on the decrypted list.
export const SubscriberTable = ({ members }: SubscriberTableProps) => {
  const t = useDictionary();
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? members.filter((member) => member.email.includes(needle)) : members;
  }, [members, query]);

  return (
    <div className="space-y-4">
      <label htmlFor="subscriber-search" className="sr-only">
        {t.subscribers.searchLabel}
      </label>
      <Input
        id="subscriber-search"
        type="search"
        placeholder={t.subscribers.searchPlaceholder(members.length)}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {visible.length === 0 ? (
        <EmptyState title={members.length === 0 ? t.subscribers.emptyTitle : t.subscribers.noMatches} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="py-2 pr-4 font-semibold">{t.subscribers.columns.email}</th>
                <th className="py-2 pr-4 font-semibold">{t.subscribers.columns.role}</th>
                <th className="py-2 pr-4 font-semibold">{t.subscribers.columns.delivery}</th>
                <th className="py-2 pr-4 font-semibold">{t.subscribers.columns.since}</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((member) => (
                <tr key={member.id}>
                  <td className="py-2 pr-4 break-all">{member.email}</td>
                  <td className="py-2 pr-4">
                    <RoleBadge role={member.role} />
                  </td>
                  <td className="py-2 pr-4">{member.emailNotifications ? t.subscribers.on : t.subscribers.off}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">{formatDate(member.createdAt, locale)}</td>
                  <td className="py-2 text-right">
                    {member.role === "subscriber" && (
                      <RemoveSubscriberButton membershipId={member.id} email={member.email} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
