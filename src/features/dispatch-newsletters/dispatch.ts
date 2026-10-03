import "server-only";
import { listUnresolvedFailures } from "@/entities/delivery/server";
import { createUnsubscribeToken, listTeamEmails } from "@/entities/membership/server";
import { getNewsletter, getNewsletterForDelivery } from "@/entities/newsletter/server";
import type { NewsletterFile } from "@/entities/newsletter";
import { getOrganisationById } from "@/entities/organisation/server";
import type { Organisation } from "@/entities/organisation";
import { decryptEmail } from "@/shared/crypto";
import { sendMail } from "@/shared/mail";
import {
  claimDeliveries,
  claimFailureAlert,
  dropDelivery,
  finishCompletedNewsletters,
  listFailureAlertCandidates,
  markDeliveryAttemptFailed,
  markDeliverySent,
  releaseFailureAlert,
  startDueNewsletters,
} from "./dal";
import { buildFailureAlertEmail, buildNewsletterEmail } from "./emails";
import type { ClaimedDelivery, DispatchReport } from "./types";

const BATCH_SIZE = 50;
// Stay well inside typical serverless/cron timeouts; leftovers go next run.
const TIME_BUDGET_MS = 45_000;

interface NewsletterContext {
  organisation: Organisation;
  file: NewsletterFile;
  summary: string | null;
}

const errorMessage = (error: unknown): string =>
  (error instanceof Error ? error.message : String(error)).slice(0, 500);

const loadContext = async (newsletterId: string): Promise<NewsletterContext | null> => {
  const file = await getNewsletterForDelivery(newsletterId);
  if (!file) return null;
  const organisation = await getOrganisationById(file.organisationId);
  return organisation ? { organisation, file, summary: file.summary } : null;
};

const sendOne = async (
  claimed: ClaimedDelivery,
  context: NewsletterContext,
  report: DispatchReport,
): Promise<void> => {
  if (!claimed.membershipId) {
    await dropDelivery(claimed.id);
    return;
  }
  try {
    await sendMail(
      buildNewsletterEmail({
        organisation: context.organisation,
        newsletter: context.file,
        summary: context.summary,
        to: decryptEmail(claimed.recipientEmailEncrypted),
        unsubscribeToken: createUnsubscribeToken(claimed.membershipId),
      }),
    );
    await markDeliverySent(claimed.id);
    report.sent += 1;
  } catch (error) {
    const isFinal = await markDeliveryAttemptFailed(claimed, errorMessage(error));
    if (isFinal) report.failed += 1;
    else report.retried += 1;
  }
};

const processDeliveries = async (report: DispatchReport, deadline: number) => {
  const contexts = new Map<string, NewsletterContext | null>();
  while (Date.now() < deadline) {
    const batch = await claimDeliveries(BATCH_SIZE);
    if (batch.length === 0) return;
    for (const claimed of batch) {
      if (!contexts.has(claimed.newsletterId)) {
        contexts.set(claimed.newsletterId, await loadContext(claimed.newsletterId));
      }
      const context = contexts.get(claimed.newsletterId);
      if (!context) {
        await dropDelivery(claimed.id);
        continue;
      }
      await sendOne(claimed, context, report);
    }
  }
};

// Emails every admin and writer. Returns true if at least one alert went out.
const sendFailureAlert = async (newsletterId: string, organisationId: string) => {
  const [organisation, meta, failures, team] = await Promise.all([
    getOrganisationById(organisationId),
    getNewsletter(organisationId, newsletterId),
    listUnresolvedFailures(organisationId, newsletterId),
    listTeamEmails(organisationId),
  ]);
  if (!organisation || !meta || failures.length === 0) return true;

  const results = await Promise.allSettled(
    team.map((to) =>
      sendMail(buildFailureAlertEmail({ organisation, newsletterTitle: meta.title, failures, to })),
    ),
  );
  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error(`[dispatch] failure alert for ${newsletterId} not delivered:`, result.reason);
    }
  });
  return results.some((result) => result.status === "fulfilled");
};

const alertTeams = async (report: DispatchReport) => {
  for (const candidate of await listFailureAlertCandidates()) {
    if (!(await claimFailureAlert(candidate.newsletterId))) continue;
    const delivered = await sendFailureAlert(candidate.newsletterId, candidate.organisationId);
    if (delivered) report.failureAlertsSent += 1;
    // Retry next run; the dashboard shows the failures in the meantime.
    else await releaseFailureAlert(candidate.newsletterId);
  }
};

/*
 * One scheduler tick. Safe to run concurrently and repeatedly:
 * 1. start due newsletters (snapshot recipients),
 * 2. send pending deliveries with retries/backoff,
 * 3. mark newsletters without pending deliveries as sent,
 * 4. alert admins and writers about permanent failures.
 */
export const runDispatch = async (): Promise<DispatchReport> => {
  const deadline = Date.now() + TIME_BUDGET_MS;
  const report: DispatchReport = {
    startedNewsletters: 0,
    sent: 0,
    retried: 0,
    failed: 0,
    finishedNewsletters: 0,
    failureAlertsSent: 0,
  };
  report.startedNewsletters = await startDueNewsletters();
  await processDeliveries(report, deadline);
  report.finishedNewsletters = await finishCompletedNewsletters();
  await alertTeams(report);
  return report;
};
