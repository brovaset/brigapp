'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import StripePaymentForm from '@/components/StripePaymentForm'
import { formatCurrency } from '@/lib/utils'

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/${params.id}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Booking not found')
          return
        }

        setBooking(data.booking)
      } catch (err) {
        console.error('Error fetching booking:', err)
        setError('Failed to load booking')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [params.id])

  useEffect(() => {
    if (!booking || clientSecret) return

    const createIntent = async () => {
      try {
        const res = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: booking.id }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Payment setup failed')
          return
        }

        setClientSecret(data.clientSecret)
      } catch (err) {
        console.error('Payment setup error:', err)
        setError('Failed to initialize payment')
      }
    }

    createIntent()
  }, [booking, clientSecret])

  if (loading || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-car-neon border-t-transparent"></div>
          <p className="text-gray-600 text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (error && !clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-car-speed mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 text-car-neon font-semibold hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-gray-600 mb-4">Stripe is not configured. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env</p>
          <button
            onClick={() => router.back()}
            className="w-full py-3 text-car-neon font-semibold hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Complete Payment</h1>

        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Parking Location</p>
            <p className="font-semibold text-gray-900">{booking.listing?.title}</p>
            <p className="text-sm text-gray-600">{booking.listing?.address}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Parking Period</p>
            <p className="font-semibold text-gray-900">
              {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Vehicle</p>
            <p className="font-semibold text-gray-900">
              {booking.vehicleMake} {booking.vehicleModel}
            </p>
            <p className="text-sm text-gray-600">License: {booking.licensePlate}</p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Amount</span>
              <span className="text-2xl font-bold text-car-electric">
                {formatCurrency(booking.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {clientSecret ? (
          <StripePaymentForm
            clientSecret={clientSecret}
            amount={booking.totalAmount}
            bookingId={booking.id}
            onSuccess={() => router.push(`/bookings/${booking.id}`)}
            onError={(msg) => setError(msg)}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-car-neon border-t-transparent"></div>
            <p className="text-sm text-gray-500">Preparing payment form...</p>
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-car-speed">{error}</p>
        )}

        <button
          onClick={() => router.back()}
          className="w-full mt-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

