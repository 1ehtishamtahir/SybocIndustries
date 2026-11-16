# SYBOC INDUSTRIES

Frontend-only marketing and product catalogue built with Next.js App Router,
React 19 and GSAP scrollytelling. Product, navigation and contact content live
in local JavaScript data files so the site can run without a database, CMS or API.

## Commands

```bash
npm install
npm run dev           # dev server (webpack)
npm run build         # production build (webpack)
npm run start         # serve the production build
npm run lint          # eslint
npm test              # Playwright frontend tests
npm run verify        # lint && test
```

`npm run dev` and `npm run build` share `.next`; kill the dev server before
`npm test`.

## Environment

Optional environment values can customize the canonical URL, analytics and
contact links. No database or CMS environment is required.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for sitemap, robots, canonical and Open Graph tags |
| `NEXT_PUBLIC_WHATSAPP` | WhatsApp number (digits); hides WhatsApp buttons when unset |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible analytics domain; disables analytics when unset |

## Tests

- `tests/smoke.spec.js` — navigation contract, forms, JSON-LD, sitemap/robots, security headers.
- `tests/a11y.spec.js` — axe (wcag2a/2aa/21a/21aa), serious+critical violations fail, on 9 routes.
- `tests/visual.spec.js` — screenshot regression (2% budget), GSAP disabled via the `window.__NO_GSAP__` seam.
- `tests/behavior.spec.js` — reduced-motion fallbacks, no-JS progressive enhancement, API rate limiting and validation.

Update visual baselines with `npx playwright test visual --update-snapshots=missing` when a change is intentional.

## Structure

- `app/` — public routes and global CSS.
- `components/` — `PageShell`, `Nav`, `Footer`, motion wrappers and quote form.
- `data/` — local product, category, FAQ, contact and hero content.
- `lib/content.js` — local data access helpers used by the public routes.
- `tests/` — Playwright suites; `npm run verify` is the full gate.
