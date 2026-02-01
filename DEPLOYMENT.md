# Deployment Guide

This guide covers deploying BRIGAP to various platforms.

## Prerequisites

- Node.js 18+ installed
- Database (SQLite for dev, PostgreSQL for production)
- Stripe account with API keys
- Google Maps API key

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/brigap"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"

# App URL
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## Deployment Options

### 1. Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The `vercel.json` file is already configured.

**Note:** For production, you'll need to:
- Set up a PostgreSQL database (e.g., Vercel Postgres, Supabase, or Railway)
- Update `DATABASE_URL` in environment variables
- Run migrations: `npx prisma migrate deploy`

### 2. Docker

Build and run with Docker:

```bash
# Build image
docker build -t brigap .

# Run container
docker run -p 3000:3000 --env-file .env brigap
```

Or use docker-compose:

```bash
docker-compose up -d
```

### 3. Traditional Server

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

3. Use a process manager like PM2:
```bash
pm2 start npm --name "brigap" -- start
```

## Database Setup

### Development (SQLite)
```bash
npx prisma db push
npx prisma generate
```

### Production (PostgreSQL)
```bash
# Update DATABASE_URL in .env
npx prisma migrate deploy
npx prisma generate
```

## Stripe Webhook Setup

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/payments/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## Health Check

The application includes a health check endpoint:
- `GET /api/health` - Returns application health status

## Security Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Use HTTPS in production
- [ ] Set secure cookie flags (already configured)
- [ ] Enable rate limiting (consider adding)
- [ ] Set up monitoring and logging
- [ ] Regular security updates
- [ ] Database backups configured

## Monitoring

Consider setting up:
- Application monitoring (e.g., Sentry)
- Uptime monitoring
- Database monitoring
- Error tracking

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database is accessible from deployment environment
- Ensure migrations have run

### Stripe Webhook Issues
- Verify webhook secret matches Stripe dashboard
- Check webhook endpoint is accessible
- Review Stripe dashboard for webhook delivery logs

### Build Failures
- Ensure all environment variables are set
- Check Node.js version matches (18+)
- Review build logs for specific errors

