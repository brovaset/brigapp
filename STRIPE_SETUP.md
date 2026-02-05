# Stripe Integration Setup

This guide covers how to integrate Stripe payments into BRIGAP.

## Dependencies

The following packages are used:

| Package | Purpose |
|---------|---------|
| `stripe` | Server-side Stripe API (Payment Intents, Webhooks) |
| `@stripe/stripe-js` | Client-side Stripe.js loader |
| `@stripe/react-stripe-js` | React components for Stripe Payment Element |

All are already in `package.json`. If needed:

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

## Environment Variables

Add to your `.env` file:

```env
# Stripe API Keys (https://dashboard.stripe.com/apikeys)
# Use test keys (pk_test_... and sk_test_...) for development
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Stripe Webhook Secret (https://dashboard.stripe.com/webhooks)
# Required for production; use Stripe CLI for local testing
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Getting Your Keys

1. Create a [Stripe account](https://dashboard.stripe.com/register)
2. Go to [API Keys](https://dashboard.stripe.com/apikeys)
3. Copy the **Publishable key** (`pk_test_...`) and **Secret key** (`sk_test_...`)
4. For production, use the live keys (`pk_live_...` and `sk_live_...`)

## Webhook Setup

### Local Development (Stripe CLI)

1. [Install Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Login: `stripe login`
3. Forward webhooks to your app:
   ```bash
   stripe listen --forward-to localhost:3000/api/payments/webhook
   ```
4. Copy the webhook signing secret (`whsec_...`) and add it to `.env` as `STRIPE_WEBHOOK_SECRET`

### Production

1. Go to [Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://yourdomain.com/api/payments/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the signing secret and add to your production env

## Test Cards (Development)

Use these in test mode:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 3220` | 3D Secure required |
| `4000 0000 0000 9995` | Declined (insufficient funds) |

Use any future expiry date, any 3-digit CVC, and any postal code.

## Files Overview

| File | Purpose |
|------|---------|
| `lib/stripe.ts` | Server-side Stripe client and helpers |
| `app/api/payments/create-intent/route.ts` | Creates PaymentIntent for a booking |
| `app/api/payments/webhook/route.ts` | Handles Stripe webhook events |
| `components/StripePaymentForm.tsx` | Payment Element form component |
| `app/bookings/[id]/payment/page.tsx` | Payment checkout page |

## Payment Flow

1. User goes to `/bookings/[id]/payment` after creating a booking
2. Page fetches booking and calls `/api/payments/create-intent`
3. API creates a PaymentIntent and returns `clientSecret`
4. Stripe Payment Element renders with the client secret
5. User enters card details and submits
6. Stripe processes payment; on success, webhook updates booking and payment status
7. User is redirected to booking confirmation
