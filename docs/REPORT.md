# Nieuwsbrief MVP: build report

**Date:** 3 October 2026 · **Status:** MVP complete, verified end-to-end in a real browser · **Tests:** none committed (out of scope by request)

## What was built

| Requirement | How it works now |
| --- | --- |
| Organisations request an account and get a subdomain | Public request form on the root domain; a platform operator approves it, which creates `<slug>.<domain>` and emails the chosen admin. |
| Visitors subscribe with their email, verified by magic link | Subscribe form on the subdomain. The subscription only exists after the link is clicked. |
| Signed-in users see the archive and the next issue | The tenant home page shows the next scheduled date and every published issue (HTML shown inline, PDF in a viewer). |
| Email notifications on/off, unsubscribe | Settings page, plus a one-click unsubscribe link and header in every email. |
| Admin account of the organisation's choosing | The admin email given in the request becomes the admin; everyone signs in passwordlessly. |
| Up to 2 writers | Admin-only page; the limit is enforced in the database transaction. |
| Extra team view: manage subscribers | Admin-only list with search, add and remove. |
| Upload and schedule the newsletter | HTML or PDF upload; schedule, send now, or save as draft; reschedule and delete until sending starts. |
| Notes leading up to a release | Shared team notes, optionally linked to an upcoming issue, with done/reopen. |
| **Team notified of failed deliveries so they can send manually** | Retries, an email alert to every admin and writer, and a dashboard panel that stays until each failure is marked handled. |
| **Email addresses stored securely** | AES-256-GCM encryption plus a keyed hash for lookups. A full database dump contains no readable addresses. |

## Key decisions

1. **Stack:** Next.js 16, Tailwind 4, better-auth, PostgreSQL via Drizzle ORM. Drizzle was picked for its native better-auth adapter and easy row-level locking.
2. **Passwordless for everyone.** One sign-in flow for subscribers, writers, admins and operators means less to secure. Subscribing and verifying are the same step.
3. **Encryption without forking the auth library.** better-auth's database adapter is wrapped so it transparently stores a keyed hash (for lookups) and ciphertext (for sending) instead of plaintext. This also covers the temporary magic-link records.
4. **The tenant always comes from the domain, never from the request body.** Every query is scoped to the organisation. Sessions are per subdomain, so being signed in on one organisation gives no access to another.
5. **Sending runs as a cron-triggered job, not an in-app timer.** It works on any hosting (serverless or not) and is safe if two runs overlap.
6. **Failures are reported two ways.** The email alert can bounce too, so the dashboard is the reliable record: failures stay visible until someone marks them handled.
7. **Least privilege.** Only the admin manages subscribers and writers. Writers can upload, keep notes, and see failed addresses (they need those to send manually).
8. **Uploaded HTML is sandboxed** in the browser so a script in a newsletter can never act on behalf of a reader.

The full reasoning, alternatives and edge cases are in [DECISIONS.md](./DECISIONS.md).

## Problems found and fixed during testing

- **Encrypted email shown in place of the real one.** The auth library loads sessions with a database join, so the signed-in user's email came back as the encrypted lookup value and platform admins were locked out. Fixed in the adapter wrapper.
- **Redirect lost the subdomain.** After confirming a subscription, the redirect sent subscribers to the root domain. Fixed with relative redirects.
- **Form state drift after upload.** After uploading a newsletter, the "schedule" option could no longer show its date field (a form-reset quirk). Fixed.
- **Lost confirmation message.** Adding the second writer hid the confirmation message. Fixed.

## How it was verified

An automated browser run walked through the whole product against a real database and mail server:
request an organisation, approve it, admin sign-in, add 2 writers (the 3rd is blocked), magic-link subscribe, admin-added subscriber, upload and send, a scheduled issue, three delivery attempts to a rejecting address, the team alert emails, the dashboard failure panel, "sent manually", reading the newsletter (an injected script stays blocked), a subscriber blocked from the team area, a settings change, and token unsubscribe. Type checking, linting and the production build all pass.

## Known limitations

- **Late bounces aren't detected yet.** Emails the mail server rejects immediately are caught. Bounces that arrive later need the email provider's webhook (a small follow-up; the dashboard already supports it).
- **Single-server rate limiting.** The sign-in limiter assumes one app server; it needs Redis or a database-backed store to scale out.
- **Key backup is critical.** If the encryption keys are lost, the stored addresses cannot be recovered.
- **No automated test suite yet.** The verification scenario above is ready to become the first test.

## Suggested next steps

1. Connect a production mail provider and its bounce webhook.
2. Turn the verification scenario into a committed Playwright test, then add unit tests for the dispatcher and the encryption.
3. Rich-text editor (writes HTML into the existing content field).
4. Organisation branding, subscriber data export and deletion (GDPR), and key rotation tooling.
