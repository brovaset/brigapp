import Stripe from 'stripe'

/**
 * Server-side Stripe client.
 * Uses STRIPE_SECRET_KEY from environment.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const getStripeSecretKey = () => process.env.STRIPE_SECRET_KEY
export const getStripePublishableKey = () => process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
export const getStripeWebhookSecret = () => process.env.STRIPE_WEBHOOK_SECRET
