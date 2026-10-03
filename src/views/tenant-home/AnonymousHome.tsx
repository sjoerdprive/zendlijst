import Link from "next/link";
import { SubscribeForm } from "@/features/subscribe";
import { Card } from "@/shared/ui";
import type { OrganisationIntroProps } from "./types";

export const AnonymousHome = ({ organisation }: OrganisationIntroProps) => (
  <div className="mx-auto max-w-xl space-y-6">
    <div className="space-y-2 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">{organisation.name}</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Subscribe to read every issue online and, if you like, receive new ones by email.
      </p>
    </div>
    <Card>
      <SubscribeForm />
    </Card>
    <p className="text-center text-sm text-zinc-500">
      Already subscribed?{" "}
      <Link href="/sign-in" className="font-medium text-zinc-900 underline dark:text-zinc-100">
        Sign in
      </Link>
    </p>
  </div>
);
