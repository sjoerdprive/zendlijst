import { JoinAsSignedInUser } from "@/features/subscribe";
import { Card } from "@/shared/ui";
import type { OrganisationIntroProps } from "./types";

export const JoinHome = ({ organisation }: OrganisationIntroProps) => (
  <div className="mx-auto max-w-xl">
    <Card title={`Subscribe to ${organisation.name}`} description="You are signed in but not subscribed yet.">
      <JoinAsSignedInUser />
    </Card>
  </div>
);
