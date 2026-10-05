import { TeamNotesView } from "@/views/team-notes";

export default async function Page(props: PageProps<"/t/[org]/team/notes">) {
  const { view } = await props.searchParams;
  return <TeamNotesView showArchive={view === "archive"} />;
}
