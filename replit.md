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
