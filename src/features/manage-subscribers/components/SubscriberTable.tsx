"use client";

import { useMemo, useState } from "react";
import { RoleBadge } from "@/entities/membership";
import { formatDate } from "@/shared/lib";
import { EmptyState, Input } from "@/shared/ui";
import type { SubscriberTableProps } from "../types";
import { RemoveSubscriberButton } from "./RemoveSubscriberButton";

// Emails are encrypted at rest, so search happens here on the decrypted list.
export const SubscriberTable = ({ members }: SubscriberTableProps) => {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? members.filter((member) => member.email.includes(needle)) : members;
  }, [members, query]);

  return (
    <div className="space-y-4">
      <label htmlFor="subscriber-search" className="sr-only">
        Search subscribers
      </label>
      <Input
        id="subscriber-search"
        type="search"
        placeholder={`Search ${members.length} members…`}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {visible.length === 0 ? (
        <EmptyState title={members.length === 0 ? "No subscribers yet." : "No matches."} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium">Role</th>
                <th className="py-2 pr-4 font-medium">Email delivery</th>
                <th className="py-2 pr-4 font-medium">Since</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {visible.map((member) => (
                <tr key={member.id}>
                  <td className="py-2 pr-4 break-all">{member.email}</td>
                  <td className="py-2 pr-4">
                    <RoleBadge role={member.role} />
                  </td>
                  <td className="py-2 pr-4">{member.emailNotifications ? "On" : "Off"}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">{formatDate(member.createdAt)}</td>
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
