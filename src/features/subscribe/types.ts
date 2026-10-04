export type JoinResult = "joined" | "requested" | "closed";

export interface SubscribeFormProps {
  requiresApproval: boolean;
}

export interface JoinAsSignedInUserProps {
  requiresApproval: boolean;
}
