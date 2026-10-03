import type { Viewer } from "@/entities/membership";
import type { Organisation } from "@/entities/organisation";

export interface TenantHomeViewProps {
  flags: TenantHomeFlags;
}

export interface TenantHomeFlags {
  welcome: boolean;
  unsubscribed: boolean;
  confirmFailed: boolean;
}

export interface OrganisationIntroProps {
  organisation: Organisation;
}

export interface HomeNoticesProps {
  flags: TenantHomeFlags;
}

export interface MemberHomeProps {
  organisationId: string;
}

export interface HomeContentProps {
  organisation: Organisation;
  viewer: Viewer | null;
}
