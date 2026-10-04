import { SiteFooter } from "@/widgets/site-footer";
import { TenantHeader } from "@/widgets/site-header";

// Reached only through the subdomain rewrite in src/proxy.ts.
export default function TenantLayout({ children }: LayoutProps<"/t/[org]">) {
  return (
    <>
      <TenantHeader />
      {children}
      <SiteFooter />
    </>
  );
}
