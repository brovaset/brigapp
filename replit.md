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

## Security — Input Sanitization (lib/validation.ts)
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

## Ratings — Two-Way System
Both drivers and hosts can independently rate the same booking:
- `Rating` model has `giverId` to track who rated
- `@@unique([bookingId, giverId])` prevents duplicate ratings per user per booking
- Booking detail page shows a "Already rated" confirmation when the current user has submitted a rating
