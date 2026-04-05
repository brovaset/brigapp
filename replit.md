# Brigap - Parking Space Booking Platform

## Overview
Brigap is a Next.js 16 web application for discovering and booking parking spaces (driveways, spots) near a user's location.

## Architecture
- **Framework**: Next.js 16 with TypeScript, App Router
- **Database**: PostgreSQL (Replit built-in) via Prisma ORM
- **Auth**: JWT-based auth with cookie storage + Google OAuth
- **Payments**: Stripe (optional integration)
- **Maps**: Google Maps API (optional integration)
- **Styling**: Tailwind CSS + Framer Motion

## Project Structure
- `app/` - Next.js App Router pages and API routes
- `components/` - Reusable React components
- `lib/` - Server-side utilities (auth, prisma client, validation)
- `prisma/` - Schema and migrations
- `types/` - TypeScript type definitions

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-set by Replit)
- `JWT_SECRET` - JWT signing secret
- `NEXT_PUBLIC_APP_URL` - Public app URL
- `GOOGLE_CLIENT_ID` / `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth (optional)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps (optional)
- `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe payments (optional)

## Development
- Run: `npm run dev -- -p 5000 -H 0.0.0.0`
- DB push: `npx prisma db push`
- DB seed: `npm run db:seed`

## Deployment
- Target: autoscale
- Build: `npm run build`
- Start: `npm run start`

## Security

### HTTP Security Headers (middleware.ts + next.config.js)
Every response carries a full suite of security headers:
- **Content-Security-Policy** — restricts script/style/image/connect sources; `object-src 'none'`; `upgrade-insecure-requests`
- **Strict-Transport-Security** — 2-year HSTS with `preload` and `includeSubDomains`
- **X-Frame-Options: SAMEORIGIN** — prevents clickjacking
- **X-Content-Type-Options: nosniff**
- **Referrer-Policy: strict-origin-when-cross-origin**
- **Permissions-Policy** — camera/microphone off; geolocation self only
- **X-Permitted-Cross-Domain-Policies: none**
- `X-Powered-By` header disabled (`poweredByHeader: false`)
- API routes forced to `Cache-Control: no-store`

### Rate Limiting (lib/rateLimit.ts)
In-memory sliding-window limiter applied per IP per route key:

| Tier | Limit | Window | Used on |
|------|-------|--------|---------|
| `auth` | 10 req | 15 min | login, register, Google OAuth |
| `write` | 30 req | 1 min | create booking/listing/message/payment/saved |
| `upload` | 20 req | 1 min | file uploads |
| `ratings` | 5 req | 1 min | rating submissions |
| `read` | 100 req | 1 min | listing/booking/message reads, health |
| `global:api` | 300 req | 1 min | global middleware fallback (all `/api/*`) |

IP extraction is hardened against X-Forwarded-For injection; the store is capped at 50,000 entries to prevent memory exhaustion.

### Account Lockout (lib/security.ts)
Per-email lockout applied on the login route:
- **5 consecutive failed attempts** triggers a 15-minute lockout
- Returns **HTTP 423** with a `Retry-After` header during lockout
- Successful login clears the lockout counter

### Timing-Safe Authentication
The login route always runs a bcrypt comparison even when the email does not exist (using a dummy hash), eliminating timing-based user-enumeration attacks.

### CORS Policy (middleware.ts)
API routes reject requests from foreign `Origin` headers with HTTP 403. Allowed origins: same host, `*.replit.dev`, `*.repl.co`, and localhost. The Stripe webhook endpoint is excluded (Stripe sends no Origin header).

### Request Body Size Limit (lib/security.ts)
`isBodyTooLarge()` checks `Content-Length` before parsing JSON:
- Login: 10 KB max
- Register: 20 KB max
- Returns HTTP 413 if exceeded

### Security Audit Logging (lib/security.ts)
`logSecurityEvent()` emits structured JSON to stdout prefixed with `[SECURITY]` for each of:
`LOGIN_SUCCESS`, `LOGIN_FAILURE`, `LOGIN_LOCKED`, `REGISTER_SUCCESS`, `REGISTER_FAILURE`, `RATE_LIMITED`, `CORS_VIOLATION`, `BODY_TOO_LARGE`, `UNAUTHORIZED_ACCESS`, `FORBIDDEN_ACCESS`

### Input Sanitization (lib/validation.ts)
All user-facing inputs go through `lib/validation.ts` helpers before reaching the database:

| Helper | Purpose |
|--------|---------|
| `sanitizeString(s)` | Strips HTML tags, null bytes, control chars, dangerous URI schemes; trims whitespace |
| `sanitizeStringMax(v, n)` | Same as above + enforces max length; returns null if blank |
| `sanitizeRequired(v, n)` | Same as `sanitizeStringMax`; returns null if result is empty |
| `validateEnum(v, allowed)` | Type-guard that checks value against an allowed set |
| `validateNumber(v, min, max)` | Parses and range-validates numbers; returns null on failure |
| `isValidUploadUrl(url)` | Allows only `/uploads/(listing|profile|message)/…` paths |

### Coverage per route
| Route | Sanitized fields |
|-------|-----------------|
| `POST /api/auth/register` | firstName, lastName (max 60), email, password strength, phone format, role enum |
| `POST /api/auth/google` | firstName, lastName from Google token |
| `POST /api/listings` | All text fields with max lengths, prices (0.01–9999), cancellationPolicy enum, vehicleSize enum, photos URL-validated |
| `PUT /api/listings/[id]` | Same as POST on any provided field |
| `POST /api/bookings` | vehicleMake, vehicleModel, licensePlate, dates validated |
| `PATCH /api/bookings/[id]` | status validated against `CONFIRMED|CANCELLED|ACTIVE|COMPLETED`; permission enforced per status |
| `POST /api/ratings` | rating 1–5 integer, comment max 1000 chars, must be COMPLETED booking |
| `POST /api/messages` | content max 1000 chars, imageUrl must match upload path pattern |

### Other Protections
- **SQL injection** — prevented by Prisma ORM parameterized queries
- **Stripe webhook** — signature verified via `stripe.webhooks.constructEvent`
- **File uploads** — MIME type whitelist (JPEG/PNG/WebP/GIF), 5 MB cap, randomized filenames
- **Dev seed route** — blocked with 404 in production (`NODE_ENV === 'production'`)
- **Auth cookies** — `httpOnly`, `secure` in production, `sameSite: lax`, `path: /`
- **JWT** — 7-day expiry, verified on every protected request

## Ratings — Two-Way System
Both drivers and hosts can independently rate the same booking:
- `Rating` model has `giverId` to track who rated
- `@@unique([bookingId, giverId])` prevents duplicate ratings per user per booking
- Booking detail page shows a "Already rated" confirmation when the current user has submitted a rating
