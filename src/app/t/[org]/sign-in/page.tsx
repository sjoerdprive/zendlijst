import { TenantSignInView } from "@/views/tenant-sign-in";

export default async function Page(props: PageProps<"/t/[org]/sign-in">) {
  const { error } = await props.searchParams;
  return <TenantSignInView hasLinkError={Boolean(error)} />;
}
