'use client'

import { useState } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import type { StripeElementsOptions } from '@stripe/stripe-js'

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null

interface StripePaymentFormProps {
  clientSecret: string
  amount: number
  bookingId: string
  onSuccess: () => void
  onError: (message: string) => void
}

function PaymentForm({ clientSecret, amount, bookingId, onSuccess, onError }: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setLoading(true)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: typeof window !== 'undefined' ? `${window.location.origin}/bookings/${bookingId}?payment=success` : '',
          receipt_email: undefined,
        },
      })

      if (error) {
        onError(error.message || 'Payment failed')
      } else {
        onSuccess()
      }
    } catch (err) {
      onError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: 'tabs' }} />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3 px-4 bg-gradient-to-r from-car-neon to-car-electric text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        {loading ? 'Processing...' : `Pay`}
      </button>
    </form>
  )
}

interface StripePaymentFormWrapperProps {
  clientSecret: string
  amount: number
  bookingId: string
  onSuccess: () => void
  onError: (message: string) => void
}

export default function StripePaymentFormWrapper({
  clientSecret,
  amount,
  bookingId,
  onSuccess,
  onError,
}: StripePaymentFormWrapperProps) {
  if (!stripePromise) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm">
        Payment is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to enable payments.
      </div>
    )
  }
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#f97316',
        colorBackground: '#ffffff',
        colorDanger: '#ff3b30',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm
        clientSecret={clientSecret}
        amount={amount}
        bookingId={bookingId}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  )
}
