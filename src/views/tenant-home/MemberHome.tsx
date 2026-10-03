import { getNextScheduledNewsletter, listPublishedNewsletters } from "@/entities/newsletter/server";
import { Archive } from "@/widgets/archive";
import type { MemberHomeProps } from "./types";

export const MemberHome = async ({ organisationId }: MemberHomeProps) => {
  const [published, next] = await Promise.all([
    listPublishedNewsletters(organisationId),
    getNextScheduledNewsletter(organisationId),
  ]);
  return <Archive published={published} next={next} />;
};
