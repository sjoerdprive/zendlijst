import Link from "next/link";
import { requireCurrentOrganisation } from "@/entities/organisation/server";
import { SignInForm } from "@/features/auth";
import { Card, Notice, PageContainer } from "@/shared/ui";
import type { TenantSignInViewProps } from "./types";

export const TenantSignInView = async ({ hasLinkError }: TenantSignInViewProps) => {
  const organisation = await requireCurrentOrganisation();
  return (
    <PageContainer width="narrow">
      <div className="space-y-4">
        {hasLinkError && <Notice tone="warning">That sign-in link is invalid or expired. Request a new one.</Notice>}
        <Card title={`Sign in to ${organisation.name}`} description="We email you a one-time link. No password needed.">
          <SignInForm />
        </Card>
        <p className="text-center text-sm text-zinc-500">
          Not subscribed yet?{" "}
          <Link href="/" className="font-medium text-zinc-900 underline dark:text-zinc-100">
            Subscribe
          </Link>
        </p>
      </div>
    </PageContainer>
  );
};
