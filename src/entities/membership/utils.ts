import type { MemberRole, TeamRole } from "./types";

export const MAX_WRITERS = 2;

export const isTeamRole = (role: MemberRole | undefined): role is TeamRole =>
  role === "admin" || role === "writer";

// Admins manage subscribers and writers; writers handle newsletters and notes.
export const canManageMembers = (role: MemberRole | undefined): boolean =>
  role === "admin";
