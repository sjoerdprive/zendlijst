import { PlatformHeader } from "@/widgets/site-header";

export default function PlatformLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <PlatformHeader />
      {children}
    </>
  );
}
