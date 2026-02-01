'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { formatCurrency } from '@/lib/utils'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/${params.id}`)
        const data = await res.json()

        if (!res.ok) {
          alert(data.error || 'Booking not found')
          router.push('/dashboard')
          return
        }

        setBooking(data.booking)
      } catch (error) {
        console.error('Error fetching booking:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [params.id, router])

  const handlePayment = async () => {
    if (!booking) return

    setProcessing(true)

    try {
      // Create payment intent
      const res = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Payment failed')
        return
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (!stripe) {
        alert('Stripe not loaded')
        return
      }

      const { error } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: {
            number: '4242424242424242', // Test card - in production, use Stripe Elements
            exp_month: 12,
            exp_year: 2025,
            cvc: '123',
          },
        },
      })

      if (error) {
        alert(error.message)
      } else {
        router.push(`/bookings/${booking.id}`)
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-car-neon border-t-transparent"></div>
          <p className="text-gray-600 text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Complete Payment</h1>

        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Parking Location</p>
            <p className="font-semibold">{booking.listing.title}</p>
            <p className="text-sm text-gray-600">{booking.listing.address}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Parking Period</p>
            <p className="font-semibold">
              {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Vehicle</p>
            <p className="font-semibold">
              {booking.vehicleMake} {booking.vehicleModel}
            </p>
            <p className="text-sm text-gray-600">License: {booking.licensePlate}</p>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount</span>
              <span className="text-2xl font-bold text-primary-600">
                {formatCurrency(booking.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This is a demo. In production, you would use Stripe Elements 
            for secure card input. For testing, use Stripe test cards.
          </p>
        </div>

        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? 'Processing...' : `Pay ${formatCurrency(booking.totalAmount)}`}
        </button>

        <button
          onClick={() => router.back()}
          className="w-full mt-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

