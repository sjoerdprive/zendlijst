import { SiteFooter } from "@/widgets/site-footer";
import { PlatformHeader } from "@/widgets/site-header";

export default function PlatformLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <PlatformHeader />
      {children}
      <SiteFooter />
    </>
  );
}
