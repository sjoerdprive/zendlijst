export type JoinResult = "joined" | "requested" | "closed";

export interface SubscribeFormProps {
  requiresApproval: boolean;
}

export interface PendingSubscription {
  email: string;
  notify: boolean;
}

export interface SubscribeEmailFormProps {
  requiresApproval: boolean;
  onSent: (pending: PendingSubscription) => void;
}

export interface SubscribeCodeFormProps {
  pending: PendingSubscription;
  message: string;
  onBack: () => void;
}

export interface JoinAsSignedInUserProps {
  requiresApproval: boolean;
}
