import { AnonymousHome } from "./AnonymousHome";
import { JoinHome } from "./JoinHome";
import { MemberHome } from "./MemberHome";
import type { HomeContentProps } from "./types";

export const HomeContent = ({ organisation, viewer }: HomeContentProps) => {
  if (!viewer) return <AnonymousHome organisation={organisation} />;
  if (!viewer.membership) return <JoinHome organisation={organisation} />;
  return <MemberHome organisationId={organisation.id} />;
};
