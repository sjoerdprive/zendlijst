import { UnsubscribeView } from "@/views/unsubscribe";

export default async function Page(props: PageProps<"/t/[org]/unsubscribe">) {
  const { token } = await props.searchParams;
  return <UnsubscribeView token={typeof token === "string" ? token : ""} />;
}
