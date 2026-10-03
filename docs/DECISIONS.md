# Decision log

A running log of decisions and challenges, written while building the MVP.
The final summary for stakeholders is in [REPORT.md](./REPORT.md).

## D1 — Stack versions
Next.js 16.3 (App Router, Turbopack, `proxy.ts` instead of `middleware.ts`), React 19.2,
Tailwind CSS 4, better-auth 1.7, Drizzle ORM 0.45 on PostgreSQL 17, nodemailer for SMTP, zod 4.
Drizzle was chosen over Prisma: first-class better-auth adapter, SQL-like API that makes
row locking (`FOR UPDATE SKIP LOCKED`) for the scheduler straightforward, no codegen step.

## D2 — Local infrastructure
`docker-compose.yml` runs Postgres and Mailpit (SMTP catcher). Ports were moved to
5433 / 1026 / 8026 because another local project already occupies the defaults.

## D3 — Email addresses at rest (top requirement)
- Every stored address is encrypted with **AES-256-GCM** (random IV, auth tag, `v1:` version
  prefix for future key rotation).
- Equality lookups and uniqueness use a **blind index**: HMAC-SHA256 of the normalised address
  with a *separate* key. The DB never holds a plaintext address.
- better-auth expects a plaintext `user.email`. Rather than forking it, its database adapter is
  wrapped (`shared/auth/encryptedAdapter.ts`): writes store the blind index in `user.email` and
  the ciphertext in `user.email_encrypted`; where-clauses on `email` are rewritten to the blind
  index; rows are decrypted on the way out. better-auth works unchanged.
- Magic-link tokens: better-auth stores the email inside `verification.value`; the wrapper
  encrypts that column too, and the token itself is stored hashed (`storeToken: "hashed"`).
- Delivery rows snapshot the recipient address (encrypted) so failed sends stay actionable
  even if the subscriber unsubscribes afterwards.
- Trade-off: no `LIKE` search on addresses. Subscriber search decrypts the org's list
  server-side and filters in memory — fine at newsletter scale (thousands), revisit beyond that.
- Keys live in env vars (`EMAIL_ENCRYPTION_KEY`, `EMAIL_HASH_KEY`). In production they belong
  in a secrets manager/KMS. Losing the encryption key means losing the addresses — back it up.

## D4 — Schema placement
All Drizzle tables live in `src/shared/db/schema.ts`. Tables reference each other across
entities (membership → organisation, user), so per-entity schema files would force
entity-to-entity imports, which FSD forbids. Entities own their DAL, types and UI instead.

## D5 — Multi-tenancy via subdomains
- `src/proxy.ts` (Next 16's replacement for `middleware.ts`) rewrites `acme.example.com/x` to
  the internal route `/t/acme/x`. Direct requests to `/t/*` on the root domain return 404.
- The tenant is **never** taken from the URL or form data: the DAL derives it from the `Host`
  header (`getCurrentOrganisation`), and every query is scoped by `organisation_id`.
- better-auth runs with a dynamic `baseURL` (`allowedHosts: [root, *.root]`), so magic links
  point at the subdomain where they were requested. Session cookies are host-only:
  signing in on `acme` grants nothing on `beta` or on the root domain (verified end-to-end).
- Locally `*.localhost` resolves to 127.0.0.1, so no hosts-file editing is needed (except Safari).
- Challenge: inside a rewritten route handler `request.url` reports the internal host, which
  sent a redirect to `localhost:3000` instead of `acme.localhost:3000`. Fixed by using
  relative `Location` headers.

## D6 — Authentication: magic links for everyone
Subscribers, writers, admins and platform operators all sign in passwordlessly. One flow is
less to build and secure, and fits "verify email through a magic link".
- Subscribing *is* verifying: the subscribe form sends a magic link whose callback carries an
  HMAC token bound to the address. The membership is only created after the link is clicked,
  and the token prevents the callback being replayed for another signed-in user.
- Tokens are stored hashed and expire after 15 minutes.
- better-auth's built-in rate limiter only covers its HTTP endpoints, not `auth.api.*` calls
  from server actions. Added a small in-memory limiter per IP + per email. It is
  single-instance only (see open items).
- Platform operators are listed in `PLATFORM_ADMIN_EMAILS`. The root sign-in form gives the same
  response for any address so it does not reveal who the operators are.
- `forbidden()`/`unauthorized()` are still experimental in Next 16, so they are not used.
  Authorization helpers return `null`; pages redirect (`/sign-in`) or 404, and actions return an error state.

## D7 — Roles and permissions
| | Subscriber | Writer | Admin |
|---|---|---|---|
| Archive, next issue, own notification setting | ✓ | ✓ | ✓ |
| Upload / schedule / delete newsletters, notes, failure dashboard | | ✓ | ✓ |
| Manage subscribers, add/remove writers (max 2) | | | ✓ |

- Subscriber management is admin-only (least privilege). Writers still see the addresses of
  *failed* deliveries, because they need them to send manually.
- The writer limit is enforced in a transaction that locks the organisation row, so two
  concurrent "add writer" clicks cannot produce a third writer.
- Removing a writer demotes them to subscriber (keeps archive access; they can unsubscribe).
- The admin cannot leave their own organisation. "Unsubscribe" turns off their emails instead.
- Admin-added subscribers get email notifications on. The UI reminds admins to only add
  people who asked for it (consent stays the organisation's responsibility).

## D8 — Newsletter content
- Upload HTML or PDF, max 4 MB (Vercel caps request bodies at 4.5 MB), stored in Postgres `bytea`. No object storage needed for an MVP;
  moving to S3-compatible storage later only touches the newsletter entity's DAL.
- HTML becomes the email body (with an unsubscribe footer injected). PDF is attached, with a short body.
- In the browser, uploaded HTML is shown in a sandboxed iframe and served with a
  `Content-Security-Policy: sandbox` header, so scripts never run even if the file URL is
  opened directly. This was verified with a `<script>` in the e2e test.
- The rich-text editor (future) can produce HTML into the same `content` column.

## D9 — Scheduling and delivery (top requirement)
- **Scheduler**: `POST /api/cron/dispatch`, protected by `CRON_SECRET`, called every minute by any
  cron (`npm run scheduler` locally). There is no in-process timer, so it works on serverless and
  multi-instance hosting alike.
- **Steps per run**: (1) due newsletters → `sending`, snapshot one `delivery` row per opted-in
  member; (2) lease pending deliveries (`FOR UPDATE SKIP LOCKED` + 5-minute lease) and send;
  (3) newsletters without pending deliveries → `sent`; (4) alert the team about failures.
- **Retries**: 3 attempts with 1- and 5-minute backoff. Then the delivery is `failed`.
- **Alerting the team**: every admin and writer gets an email listing the failed addresses
  and SMTP errors. The alert is claimed atomically (sent once). If it cannot be delivered to
  anyone, it is released and retried on the next run.
- **The dashboard is the safety net**: unresolved failures are shown at the top of the team
  overview, with "Download newsletter", "Copy addresses" and "Sent manually" / "Mark all
  handled". That way the team sees the failures even if the alert email itself bounces.
- Delivery is at-least-once. A crash between SMTP acceptance and recording "sent" can lead to
  a duplicate after the lease expires; for newsletters a rare duplicate beats a lost email.
- Emails carry `List-Unsubscribe` + `List-Unsubscribe-Post` (RFC 8058 one-click). The visible link
  goes to a confirmation page (with a button) so link-scanning mail filters can't unsubscribe people.
- Limitation: only *synchronous* SMTP failures (rejections, connection errors) are detected.
  Bounces that arrive later need a provider webhook (e.g. Postmark/SES bounce notifications)
  that marks the delivery `failed`; the data model and dashboard already support it.

## D10 — Notifications are opt-in per membership
"Turn on email notifications" is modelled as `membership.email_notifications`. The subscribe
form has the checkbox pre-ticked (visible, explicit choice); subscribers can change it in
Settings. Members without it still read every issue in the archive. Admins and writers start
with it off and can turn it on like anyone else.

## D11 — FSD conventions used in this repo
- Each slice has a client-safe `index.ts` barrel and, when it has data access, a `server.ts`
  barrel (all files behind it import `server-only`). This prevents a client component from
  pulling database code in through a barrel import.
- Entity DALs return DTOs (never raw rows with ciphertext). Authorization lives in the
  feature actions/views, using `authorizeMember` from the membership entity.
- Some imports that would cross slices were moved down instead: unsubscribe tokens went to the
  membership entity (used by two features), the platform-admin check went to `shared/auth`, and
  the team nav was merged into the `team-shell` widget.
- Empty `components/` or `hooks/` folders are not created when a slice has none (git does not
  track them anyway). No custom hooks were needed: `useActionState` covers form state.

## D12 — Challenges found during end-to-end testing
Testing ran in a real browser (headless Chrome via playwright-core) against the dev server, with
Mailpit configured to reject `@bounce.test` so failures were genuine SMTP 550s.
1. better-auth loads sessions with a SQL join on `user`; the joined row was not decrypted, so
   the session email was the blind index. The adapter wrapper now decodes joined users too.
2. Caching the auth instance on `globalThis` kept a stale adapter across dev hot reloads;
   now cached at module scope (only the DB pool lives on `globalThis`).
3. React resets forms after a successful action. Controlled radio buttons got out of sync with
   the DOM, so the date field could not be brought back. Fixed with uncontrolled inputs plus CSS
   `:has()`, and a date input that follows native form resets.
4. Reaching the writer limit unmounted the add-writer form together with its success
   message. The form now stays mounted and becomes disabled.
5. A full database dump after the test run contains **zero** plaintext email addresses.

## Open items / next steps
- Automated tests (explicitly out of scope for this MVP). The e2e scenario above is a good first Playwright test.
- Provider bounce/complaint webhooks → mark deliveries failed.
- Shared rate-limit store (Redis/DB) when running more than one instance.
- Key rotation tooling (`v2:` ciphertexts + re-encrypt job); KMS-backed keys.
- Throughput: sending is sequential per run (~45 s budget). Fine for thousands of
  subscribers per minute with a decent SMTP provider; use the provider's batch API beyond that.
- Rich-text editor; organisation branding (logo/colours); GDPR export/delete for subscribers.
