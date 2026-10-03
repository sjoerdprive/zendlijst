# Nieuwsbrief

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
