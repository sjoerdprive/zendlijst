import Link from "next/link";
import { PageContainer } from "@/shared/ui";

export const NotFoundView = () => (
  <PageContainer width="narrow">
    <div className="space-y-3 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-zinc-500">This page does not exist or you do not have access to it.</p>
      <Link href="/" className="font-medium underline">
        Go home
      </Link>
    </div>
  </PageContainer>
);
