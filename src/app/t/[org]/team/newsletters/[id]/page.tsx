import { TeamNewsletterEditView } from "@/views/team-newsletter-edit";

export default async function Page(props: PageProps<"/t/[org]/team/newsletters/[id]">) {
  const { id } = await props.params;
  return <TeamNewsletterEditView newsletterId={id} />;
}
