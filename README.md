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
   - `SESSION_SECRET` — generate one with `openssl rand -base64 32`
   - `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` — your first admin login, used only by the seed script

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

6. Log into the admin console at `/admin/login` with the email/password you set in `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`.

## Database commands

- `npm run db:generate` — generate a new migration after changing `lib/db/schema.ts`
- `npm run db:migrate` — apply pending migrations
- `npm run db:seed` — re-run the seed script (safe to re-run; uses `onConflictDoNothing`)
- `npm run db:studio` — opens Drizzle Studio, a GUI for browsing your database

## Stack notes

- **ORM**: [Drizzle](https://orm.drizzle.team), not Prisma — Prisma's engine binaries need network access this environment didn't have during development, so this was built and verified against Drizzle instead. Functionally equivalent for this project's needs.
- **Auth**: real bcrypt password hashing (`bcryptjs`) and DB-backed session tokens in httpOnly cookies (`lib/session.ts`) — no more localStorage.
- **Admin mutations**: Next.js Server Actions (`lib/actions/`), each re-checking the admin session server-side via `requireAdmin()` — the UI hiding buttons is not what protects these.
