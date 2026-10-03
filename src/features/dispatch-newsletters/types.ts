export interface ClaimedDelivery {
  id: string;
  newsletterId: string;
  membershipId: string | null;
  recipientEmailEncrypted: string;
  attempts: number;
}

export interface FailureAlertCandidate {
  newsletterId: string;
  organisationId: string;
}

export interface DispatchReport {
  startedNewsletters: number;
  sent: number;
  retried: number;
  failed: number;
  finishedNewsletters: number;
  failureAlertsSent: number;
}
