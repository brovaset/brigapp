# Deployment Guide

This guide covers deploying BRIGAP to Vercel with PostgreSQL.

## Important: PostgreSQL Required

**BRIGAP uses PostgreSQL only.** SQLite is no longer supported. Vercel's serverless runtime has an ephemeral filesystem, so SQLite would lose data when functions sleep. Use a hosted Postgres provider (Neon, Supabase, Railway) for both local dev and production.

**If your `.env` still has `DATABASE_URL="file:./prisma/dev.db"`**, update it to a PostgreSQL connection string before running the app.

## Prerequisites

- Node.js 20.9.0+ (see `.nvmrc` and `package.json` engines)
- PostgreSQL database (Neon, Supabase, Railway, or Vercel Postgres)
- Stripe account with API keys
- Google Maps API key
- Google OAuth Client ID (for sign-in)

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/brigap` |
| `JWT_SECRET` | Secret for JWT signing (min 32 chars) | `openssl rand -base64 32` |
| `STRIPE_SECRET_KEY` | Stripe API secret key | `sk_test_...` or `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` or `pk_live_...` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key | `AIza...` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `...apps.googleusercontent.com` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Same as above (for client) | Same |
| `NEXT_PUBLIC_APP_URL` | Full app URL | `https://your-app.vercel.app` or `http://localhost:3000` |

---

## Vercel Deployment (Recommended)

### Step 1: Create a PostgreSQL Database

Choose one:

- **[Neon](https://neon.tech)** – Free tier, fast setup
- **[Supabase](https://supabase.com)** – Free tier, includes auth
- **[Railway](https://railway.app)** – Free trial
- **[Vercel Postgres](https://vercel.com/storage/postgres)** – Native integration

Get your connection string (e.g. `postgresql://user:pass@host.region.aws.neon.tech/neondb?sslmode=require`).

### Step 2: Add Environment Variables in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add each variable from the table above for **Production**, **Preview**, and **Development** as needed
3. Ensure `DATABASE_URL` uses your Postgres connection string

### Step 3: Deploy

1. Push to GitHub
2. Connect the repo in Vercel (or use the existing GitHub integration)
3. Vercel will run:
   - `npm install`
   - `npm run build` (which runs `prisma generate && prisma migrate deploy && next build`)

Migrations run during build, so no manual `prisma migrate deploy` is needed.

### Step 4: Post-Deploy

1. **Stripe Webhooks**  
   - Add endpoint: `https://your-app.vercel.app/api/payments/webhook`  
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`  
   - Set `STRIPE_WEBHOOK_SECRET` in Vercel

2. **Google OAuth**  
   - Add `https://your-app.vercel.app` to Authorized JavaScript origins in Google Cloud Console

3. **App URL**  
   - Set `NEXT_PUBLIC_APP_URL` to your Vercel URL

---

## Local Development

### Using Neon (Free Tier)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a project and copy the connection string
3. Set in `.env`:

   ```
   DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

### Using Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings** → **Database** → Connection string (URI)
3. Add to `.env`:

   ```
   DATABASE_URL="postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres"
   ```

### Run Migrations & Dev Server

```bash
npm install
npx prisma migrate deploy   # Apply migrations (first time or after schema changes)
npm run db:seed             # Create test user (optional, for local login without signup)
npm run dev
```

**Test user** (after `npm run db:seed`): `test@brigap.com` / `Test123!`

---

## Database Migrations

- **First deploy** or **schema changes**: Migrations run via `prisma migrate deploy` in `npm run build`
- **Manual run** (if needed):

  ```bash
  npx prisma migrate deploy
  ```

---

## Stripe Webhook Setup

1. Stripe Dashboard → **Webhooks** → **Add endpoint**
2. URL: `https://your-domain.com/api/payments/webhook`
3. Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy signing secret → set as `STRIPE_WEBHOOK_SECRET` in Vercel

---

## Node.js Version

The project uses Node.js **20.9.0** (`.nvmrc`, `package.json` engines, GitHub Actions). Vercel supports 20.x. No extra config needed.

---

## Python Scripts

`database lookup.py` and `login test.py` are local dev/test helpers. They are not used by the Next.js build and do not affect Vercel deployment.

---

## Troubleshooting

### Database Connection Fails

- Verify `DATABASE_URL` format (Postgres URI with `postgresql://`)
- For Neon/Supabase: ensure `?sslmode=require` is included if required
- If you see "bad certificate format" or TLS errors with Neon, try `?sslmode=require` or `?sslmode=no-verify` (dev only)
- Check DB is reachable from Vercel (allow external connections, no IP allowlists blocking Vercel)

### Invalid Credentials (Existing User from SQLite)

To migrate users and data from the old SQLite database to Postgres:

```bash
npm run db:migrate-from-sqlite
```

This reads from `prisma/prisma/dev.db` (or set `SQLITE_PATH` to override) and writes to the Postgres DB from `DATABASE_URL`. Your existing users, listings, bookings, and messages will be copied. Then log in with your original email and password.

If the script fails with "bad certificate format" or TLS errors when connecting to Neon, add `?sslmode=no-verify` to your `DATABASE_URL` (local dev only) and try again.

### Invalid Credentials (Test User)

- Use exact credentials: `test@brigap.com` / `Test123!` (case-sensitive)
- Create the test user: run `npm run db:seed`, or if it fails with TLS errors, start the dev server (`npm run dev`) and then run:
  ```bash
  curl -X POST http://localhost:3000/api/dev/seed
  ```
  The dev seed API runs in the Next.js server, so it uses the same DB connection as login.

### Build Fails: "Migration failed"

- Ensure `DATABASE_URL` is set in Vercel env vars
- Run `npx prisma migrate deploy` locally against the production DB to confirm migrations apply

### Stripe Webhooks Failing

- Confirm `STRIPE_WEBHOOK_SECRET` matches the webhook in Stripe
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/payments/webhook`
