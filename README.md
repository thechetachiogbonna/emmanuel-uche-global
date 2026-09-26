# Emmanuel Uche Global

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up Postgres. Any of these work:
   - Local Postgres (Postgres.app on Mac, or Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16`)
   - A hosted instance: [Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app), or [Render](https://render.com) all have free tiers

3. Copy the env example and fill in your real values:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL` — your Postgres connection string
   - `BETTER_AUTH_SECRET` — generate one with `openssl rand -base64 32`
   - `ADMIN_EMAIL` / `ADMIN_SEED_PASSWORD` — your first admin login, used only by the seed script

4. Run migrations, then seed:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

   This creates your admin user and seeds the same collections/products the site shipped with, plus a few sample customers and orders so the admin console isn't empty.

5. Start the dev server:

   ```bash
   npm run dev
   ```

6. Log in at `/login` with the email/password you set in `ADMIN_EMAIL` / `ADMIN_SEED_PASSWORD`, then visit `/admin` — that account is seeded with the "admin" role, so it'll load the console instead of bouncing you home.

## Database commands

- `npm run db:generate` — generate a new migration after changing `lib/db/schema.ts`
- `npm run db:migrate` — apply pending migrations
- `npm run db:seed` — re-run the seed script (safe to re-run; uses `onConflictDoNothing`)
- `npm run db:studio` — opens Drizzle Studio, a GUI for browsing your database

## Stack notes

- **ORM**: [Drizzle](https://orm.drizzle.team), not Prisma — Prisma's engine binaries need network access this environment didn't have during development, so this was built and verified against Drizzle instead. Functionally equivalent for this project's needs.
- **Auth**: [Better Auth](https://www.better-auth.com) — real password hashing and session management handled by the library itself (not hand-rolled), backed by Postgres via its Drizzle adapter. There's no single `/login` split between customers and admins — anyone can sign up at `/login` or `/signup`, and the one account seeded with `role: "admin"` (via the `admin` plugin) is what unlocks `/admin`. `proxy.ts` gates `/admin/*` at the network level; `requireAdmin()` in `lib/auth.ts` re-checks the same thing inside every admin Server Action, since those are technically independent endpoints.
- **Admin mutations**: Next.js Server Actions (`lib/actions/`), each calling `requireAdmin()` — the UI hiding buttons is not what protects these.
