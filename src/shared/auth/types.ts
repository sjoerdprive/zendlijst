export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export type CodeSignInResult =
  | { status: "ok"; userId: string }
  | { status: "invalid" | "expired" | "locked" };
