# Deploying First Moto (GoDaddy cPanel)

One Node.js app serves the public site, the `/admin` CMS and the APIs. There is
no static export and no PHP. The only state is MySQL plus `public/uploads/`.

## 1. Create the database (cPanel)

cPanel → **MySQL® Databases**: create a database and a user, add the user to
the database with **ALL PRIVILEGES**. Note the prefixed names, e.g.
`godaddy_firstmoto` / `godaddy_user`.

## 2. Upload the code

Upload the repository (File Manager zip upload + extract, or git) **without**
`node_modules/`, `.next/`, `.dev-mysql/` — all are gitignored. The Prisma
client under `app/generated/prisma` is generated during build, not uploaded.

## 3. Build once (cPanel → Terminal, or SSH)

```bash
npm install            # prisma/typescript live in dependencies, so production installs work
npx prisma migrate deploy
npm run build          # also runs `prisma generate` via prebuild
npm run db:seed        # first deploy only: admin user, nav, settings, suits
```

## 4. Register the app (cPanel → Setup Node.js App)

| Field | Value |
| --- | --- |
| Node version | 20 or newer |
| Application root | the repository root |
| Application URL | your domain (root path) |
| Application Startup File | `server.js` |

Add the environment variables (Environment Variables → Add):

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | `mysql://USER:PASSWORD@localhost:3306/DATABASE` |
| `SESSION_SECRET` | long random string (sessions are HMAC-signed with it) |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.example` |
| `RESEND_API_KEY`, `RESEND_FROM`, `EMAIL_TO` | optional — quote-form email delivery |

Then **Create**/**Restart** the app. `server.js` boots the same Next request
handler `npm start` uses; Passenger sets `NODE_ENV=production` and `PORT`.

Contact details, opening hours, hero slides, SEO defaults and the WhatsApp
number are CMS settings (**Admin → Settings**) — no redeploy needed to edit
them. `EMAIL_TO` only overrides the CMS contact address if set.

## 5. First login

Open `/admin`:

- Email: `admin@firstmoto.example`
- Password: `Admin123!`

**Change it immediately** (Admin → Users → edit → new password). Create
additional EDITOR accounts for staff who should not touch users/settings.

## Redeploys

```bash
git pull            # or upload changed files
npx prisma migrate deploy   # only when prisma/migrations changed
npm install                 # only when package.json changed
npm run build
```
Restart the app from cPanel.

## Notes

- **Uploads**: files added in Admin → Media are written to `public/uploads/`.
  The directory ships with a `.gitkeep`; re-uploaded files are kept on the
  server but are not in git, so archive them if you migrate hosts.
- **Subdirectory installs** (e.g. `example.com/shop`) need `basePath` in
  `next.config.js` — deploy at the domain root instead if you can.
- **Backups**: the database (cPanel → Backup / phpMyAdmin) plus
  `public/uploads/`.
- **Local development**: `npm run db:up` starts the project-local MySQL on
  port 3307 (Windows), then `npm run db:seed` and `npm run dev`.
  `npm run db:down` stops it; it never touches a system MySQL service.
