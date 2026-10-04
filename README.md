# First Moto

Marketing site + self-hosted CMS for First Moto racing suits. Next.js App
Router (plain JS), React 19, GSAP scrollytelling, MySQL via Prisma, custom
session auth, Playwright test suite. One Node app serves the public site, the
`/admin` dashboard and the APIs — see [DEPLOYMENT.md](DEPLOYMENT.md) for
GoDaddy cPanel deployment.

## Commands

```bash
npm install
npm run db:up         # project-local MySQL 8.4 on 127.0.0.1:3307 (Windows)
npm run db:seed       # admin user, nav, settings, suits (idempotent)
npm run dev           # dev server (webpack)
npm run build         # production build (webpack)
npm run start         # serve the production build
npm run lint          # eslint
npm test              # playwright: smoke + a11y + visual + behavior + admin (builds first)
npm run verify        # lint && test — the gate before committing
```

Other database scripts: `db:down`, `db:status`, `db:migrate` (dev, creates a
migration), `db:deploy` (apply committed migrations).

`npm run dev` and `npm run build` share `.next`; kill the dev server before
`npm test`.

## CMS

- Public content is read from MySQL on every request (`lib/content.js`);
  `prisma/seed.mjs` loads the baseline (settings, navigation, suits, admin).
- `/admin` — login, dashboard, Pages, Products, Blog (+ categories/tags),
  Media uploads, Navigation, Submissions, and (ADMIN only) Settings + Users.
- Roles: ADMIN manages users/settings; EDITOR manages content only.
  Admin API routes live under `/api/admin/*` and return 401/403 JSON.
- Seeded login: `admin@firstmoto.example` / `Admin123!` — change it.

## Environment

Copy `.env.example`. Local development needs `DATABASE_URL` and
`SESSION_SECRET` (plus the optional delivery/analytics keys below).

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | MySQL connection string, e.g. `mysql://root@127.0.0.1:3307/firstmoto` |
| `SESSION_SECRET` | HMAC key for the signed admin session cookie |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for sitemap, robots, canonical and Open Graph tags |
| `NEXT_PUBLIC_WHATSAPP` | WhatsApp number (digits); hides WhatsApp buttons when unset |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible analytics domain; disables analytics when unset |
| `RESEND_API_KEY`, `RESEND_FROM`, `EMAIL_TO` | Quote-form delivery via Resend; without a key the API only logs |

Site copy, contact details, opening hours and hero slides are edited in
**Admin → Settings**, not via environment variables.

## Tests

- `tests/smoke.spec.js` — navigation contract, forms, JSON-LD, sitemap/robots, security headers.
- `tests/a11y.spec.js` — axe (wcag2a/2aa/21a/21aa), serious+critical violations fail, on 9 routes.
- `tests/visual.spec.js` — screenshot regression (2% budget), GSAP disabled via the `window.__NO_GSAP__` seam.
- `tests/behavior.spec.js` — reduced-motion fallbacks, no-JS progressive enhancement, API rate limiting and validation.
- `tests/admin.spec.js` — login/logout, draft→publish CRUD roundtrip, RBAC (ADMIN vs EDITOR), submission inbox.

Update visual baselines with `npx playwright test visual --update-snapshots=missing` when a change is intentional.

## Structure

- `app/` — routes (`app/[slug]` renders CMS pages), admin dashboard, API route handlers, global CSS.
- `components/` — `PageShell` (shared page frame), `Nav`, `Footer`, motion wrappers, admin forms.
- `lib/` — content queries (`lib/content.js`), auth/sessions (`lib/auth.js`), admin API helpers, revalidation.
- `prisma/` — schema, migrations, seed; generated client lands in `app/generated/prisma`.
- `tests/` — Playwright suites; `npm run verify` is the full gate.
