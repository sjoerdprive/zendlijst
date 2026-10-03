import { PlatformSignInView } from "@/views/platform-sign-in";

export default async function Page(props: PageProps<"/sign-in">) {
  const { error } = await props.searchParams;
  return <PlatformSignInView hasLinkError={Boolean(error)} />;
}
