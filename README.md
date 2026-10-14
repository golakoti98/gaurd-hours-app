# GuardHours

Mobile-first **Security Guard Working Hours Tracker** built with Next.js, Tailwind CSS, and Supabase. Installable as a PWA and ready for Vercel deployment and Google Play packaging (TWA / PWABuilder).

## Features

- Guard login with **employee ID** or **mobile number** + password
- **Clock in / clock out** with duplicate and multi-shift protection
- Live shift duration on Home
- **History** with date filters and daily / weekly / monthly totals
- **Profile** with site assignment and sign out
- **Admin** dashboard: guards, sites, attendance filters, total hours
- **PWA**: manifest, icons, standalone display, static-asset service worker
- **RLS** on Supabase: guards see only their data; admins manage org data

## Local setup

### 1. Clone and install

```bash
npm install
npm run generate:icons
```

### 2. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run the migration file:
   - `supabase/migrations/001_initial_schema.sql`
3. Under **Authentication → Providers**, enable **Email** (password sign-in).
4. Copy **Project URL** and **anon** / **service_role** keys.

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

### 4. Create the first admin

With `.env.local` loaded in your shell:

```bash
# PowerShell
$env:NEXT_PUBLIC_SUPABASE_URL="..."
$env:SUPABASE_SERVICE_ROLE_KEY="..."
node scripts/create-admin.mjs ADMIN001 "Site Admin" "ChangeMe123!"
```

Sign in at `/login` with employee ID `ADMIN001` and your password.

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admins use the **Admin dashboard** to add sites and guards. Guards sign in on their phones and use **Clock In / Clock Out** from Home.

## Deploy on Vercel

1. Push the repo to GitHub and import the project in [Vercel](https://vercel.com).
2. Add environment variables (same as `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (production only, never `NEXT_PUBLIC_`)
   - `NEXT_PUBLIC_TIMEZONE`
3. Deploy. The build runs `next build` automatically.

Use your Vercel URL as the PWA `start_url` origin when testing install prompts.

## PWA install (Android)

1. Deploy to HTTPS (Vercel).
2. Open the site in **Chrome on Android** → menu → **Install app** / **Add to Home screen**.
3. The app uses `display: standalone`, theme color `#064e3b`, and cached static assets only (no private attendance data offline).

## Google Play Store (AAB via PWABuilder / TWA)

1. Deploy production build to a stable HTTPS URL.
2. Open [PWABuilder](https://www.pwabuilder.com/) and enter your URL; fix any manifest/icon warnings.
3. Generate an **Android package** (Trusted Web Activity).
4. Create a [Google Play Console](https://play.google.com/console) app, upload the `.aab`, complete store listing, privacy policy, and content rating.
5. Use the same signing key for updates.

Optional: [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) CLI for local TWA builds.

## Security notes

- `SUPABASE_SERVICE_ROLE_KEY` is used only in server actions/scripts (login lookup, create guard). Never add it to client code.
- Guards cannot edit `clock_in` / `clock_out` directly (trigger + RLS).
- Admin routes are protected in middleware and server layouts.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run generate:icons` | Regenerate PWA icons |

## Project structure

```
src/app/          # Routes (login, guard pages, admin)
src/actions/      # Server actions (auth, attendance, admin)
src/components/   # UI components
src/lib/          # Supabase clients, time helpers, queries
supabase/         # SQL migrations
public/           # sw.js, icons
scripts/          # Admin bootstrap, icon generation
```

## Timezone

All stored timestamps are UTC in PostgreSQL. The UI formats times using `NEXT_PUBLIC_TIMEZONE` (default `Asia/Kolkata`).
