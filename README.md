# Zendlijst

Multi-tenant newsletter platform. Organisations get their own subdomain where people
subscribe with a magic link, read the archive and choose whether new issues arrive by email.
Admins and up to two writers upload and schedule newsletters, keep notes, manage subscribers,
and are alerted when emails fail to deliver.

- Stack: Next.js 16 (App Router), React 19, Tailwind CSS 4, better-auth (magic link),
  Drizzle ORM + PostgreSQL, nodemailer (SMTP).
- Architecture: Feature-Sliced Design (`shared → entities → features → widgets → views`, `app/` is thin routing).
- Decisions and trade-offs: [docs/DECISIONS.md](docs/DECISIONS.md) · summary: [docs/REPORT.md](docs/REPORT.md)

## Getting started

```bash
cp .env.example .env.local
# fill in the secrets:
#   BETTER_AUTH_SECRET, EMAIL_ENCRYPTION_KEY, EMAIL_HASH_KEY  ->  openssl rand -base64 32
#   CRON_SECRET                                              ->  openssl rand -hex 24
#   PLATFORM_ADMIN_EMAILS                                    ->  your email
npm install
npm run db:up        # Postgres on :5433, Mailpit on :1026 (SMTP) / :8026 (web UI)
npm run db:migrate
npm run dev          # http://localhost:3000
npm run scheduler    # in a second terminal: sends due newsletters every minute
```

All emails land in Mailpit: <http://localhost:8026>.

### Walkthrough

1. Open <http://localhost:3000>, request an account (e.g. subdomain `acme`).
2. Sign in at <http://localhost:3000/sign-in> with an address from `PLATFORM_ADMIN_EMAILS`
   and approve the request. The organisation admin gets a welcome email.
3. The admin signs in at <http://acme.localhost:3000/sign-in> (`*.localhost` resolves to
   your machine in Chrome, Firefox and Edge; for Safari add `/etc/hosts` entries).
4. Under **Team** the admin adds writers, uploads a newsletter (HTML or PDF) and schedules it.
5. Subscribers visit <http://acme.localhost:3000>, enter their email and confirm via the link.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` / `typecheck` | ESLint / TypeScript |
| `npm run db:up` | Start Postgres + Mailpit (docker compose) |
| `npm run db:generate` / `db:migrate` | Create / apply Drizzle migrations |
| `npm run scheduler` | Local cron: `POST /api/cron/dispatch` every 60 s |

## Production notes

- Point a wildcard DNS record (`*.example.com`) and the apex at the app, with a wildcard TLS certificate.
  Set `APP_ROOT_DOMAIN=example.com` and `APP_PROTOCOL=https`.
- Call `POST /api/cron/dispatch` with `Authorization: Bearer $CRON_SECRET` every minute
  (system cron, Vercel Cron, GitHub Actions, …). Runs are safe to overlap.
- Keep `EMAIL_ENCRYPTION_KEY` and `EMAIL_HASH_KEY` in a secrets manager and back them up:
  without them the stored addresses cannot be recovered.
- Use a real SMTP provider (Postmark, SES, Mailgun, …) via the `SMTP_*` variables.

## Project structure

```
src/
  app/        Next.js routes only: thin page/layout/route files
  proxy.ts    Rewrites <slug>.<root>/path → /t/<slug>/path
  views/      One root component per page
  widgets/    Page sections (headers, team shell, archive)
  features/   User-facing behaviour: subscribe, publish, dispatch, notes, …
  entities/   Domain concepts with their DAL: organisation, membership, newsletter, delivery, note
  shared/     Infrastructure: db schema, auth, crypto, mail, config, UI kit
```

Each slice exposes a client-safe `index.ts` and, where it has data access, a server-only `server.ts`.

## Languages and theme

- Dutch is the default language; English is available through the NL/EN switch in the header.
  The choice is stored in a `locale` cookie, shared across tenant subdomains when `APP_ROOT_DOMAIN` has a dot.
- All UI and email text lives in `src/shared/i18n/dictionaries/` (`nl.ts` is the source of truth, `en.ts` must match its shape).
  Server code uses `getDictionary()` from `@/shared/i18n/server`; client components use `useDictionary()`.
- Sign-in emails follow the requester's language. Emails to other people (newsletters, failure alerts, writer
  invitations, welcome emails) are sent in Dutch, because the recipient's preference is unknown.
- Colours are design tokens in `src/app/globals.css` (Delft blue, Dutch orange, warm paper), with a dark-mode set.
  Components use them via Tailwind classes such as `bg-surface`, `text-muted` and `bg-brand`.

## Scheduling

- Newsletters are scheduled per day, not per minute: they go out on the chosen date between 08:00 and 09:00
  Dutch time. Two daily Vercel crons (06:00 and 07:00 UTC) make that hold in both summer and winter time;
  the delivery moment is stored as 08:00 Europe/Amsterdam (`src/entities/newsletter/schedule.ts`).
- "Send now" does not wait for the cron: it triggers the dispatcher right after the upload.
- All dates in the UI are shown in Dutch time (`APP_TIME_ZONE` in `src/shared/lib/format.ts`).

## Subscription policy

Organisation admins choose under Team → Organisation who can subscribe: anyone (`open`), anyone after
admin approval (`approval`, requests appear on the Subscribers page), or nobody through the site
(`closed`, admins add subscribers manually). Pending requests live in `subscription_request` and never grant
archive access.

## Metrics

Team → Statistieken shows per sent issue: recipients, delivered (with delivery rate), failed and how many
members opened it in the archive (`newsletter_read`, one row per member and issue, removed on unsubscribe).
Emails themselves are not tracked: no pixels, no redirected links.

## Privacy & terms

`/privacy` (on the root domain and every organisation subdomain, linked in the footer, the subscribe form and
every newsletter email) describes the data processed, the security measures, the hosting locations and where
our influence ends. Copy lives in the `legal` section of the dictionaries; keep it in sync with the code.
Operator: WebModu.

## Security

- Strict nonce-based Content Security Policy on every page (set in `src/proxy.ts`), plus
  `Permissions-Policy`, `X-Frame-Options`, `nosniff` and `Cross-Origin-Opener-Policy` headers.
- Uploaded HTML is sanitised with DOMPurify (scripts, event handlers, `javascript:` URLs, frames and forms
  removed) and served in a script-less sandbox; PDFs must start with a real PDF signature.
- All database access goes through Drizzle with bound parameters; React escapes all rendered text and
  emails escape every interpolated value.
