import type { MemberWithEmail } from "@/entities/membership";

export interface WriterListProps {
  writers: MemberWithEmail[];
  admin: MemberWithEmail | null;
}

export interface RemoveWriterButtonProps {
  membershipId: string;
}

export interface AddWriterFormProps {
  limitReached: boolean;
}
