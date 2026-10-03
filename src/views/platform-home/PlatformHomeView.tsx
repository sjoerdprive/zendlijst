import { RequestOrganisationForm } from "@/features/request-organisation";
import { getEnv } from "@/shared/config";
import { Card, PageContainer } from "@/shared/ui";

const FEATURES = [
  { title: "Your own subdomain", body: "Share one simple address with your clients, members or fans." },
  { title: "Passwordless & private", body: "Subscribers confirm with a magic link. Every email address is stored encrypted." },
  { title: "Nothing gets lost", body: "If an email bounces, your team is alerted with the exact addresses to follow up on." },
];

export const PlatformHomeView = () => (
  <PageContainer>
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
      <section className="space-y-6">
        <h1 className="text-4xl font-semibold tracking-tight">A calm home for your newsletter.</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Upload an issue, pick a moment, and we deliver it to everyone who subscribed, with an archive they can always come back to.
        </p>
        <ul className="space-y-4">
          {FEATURES.map((feature) => (
            <li key={feature.title}>
              <p className="font-medium">{feature.title}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{feature.body}</p>
            </li>
          ))}
        </ul>
      </section>
      <Card title="Request an account" description="We review every request and email you once your space is ready.">
        <RequestOrganisationForm rootDomain={getEnv().APP_ROOT_DOMAIN} />
      </Card>
    </div>
  </PageContainer>
);
