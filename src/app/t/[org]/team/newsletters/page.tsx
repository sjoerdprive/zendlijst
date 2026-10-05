import { TeamNewslettersView } from "@/views/team-newsletters";

export default async function Page(props: PageProps<"/t/[org]/team/newsletters">) {
  const { sending } = await props.searchParams;
  return <TeamNewslettersView sendingStarted={sending === "1"} />;
}
