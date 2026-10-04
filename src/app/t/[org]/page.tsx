import { TenantHomeView } from "@/views/tenant-home";

export default async function Page(props: PageProps<"/t/[org]">) {
  const query = await props.searchParams;
  return (
    <TenantHomeView
      flags={{
        welcome: query.welcome === "1",
        unsubscribed: query.unsubscribed === "1",
        confirmFailed: query.error === "confirm",
        requested: query.requested === "1",
        closed: query.error === "closed",
      }}
    />
  );
}
