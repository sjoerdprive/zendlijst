import { NewsletterPageView } from "@/views/newsletter";

export default async function Page(props: PageProps<"/t/[org]/newsletters/[id]">) {
  const { id } = await props.params;
  return <NewsletterPageView newsletterId={id} />;
}
