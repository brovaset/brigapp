'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'
import type { Session } from '@/lib/session'

type Tab = 'search' | 'listings' | 'bookings'

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-amber-50 text-amber-700 border border-amber-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border border-blue-200',
  ACTIVE:    'bg-green-50 text-green-700 border border-green-200',
  COMPLETED: 'bg-gray-100 text-gray-600 border border-gray-200',
  CANCELLED: 'bg-red-50 text-red-600 border border-red-200',
}

const STATUS_LABEL: Record<string, string> = {
  PENDING:   'Pending',
  CONFIRMED: 'Confirmed',
  ACTIVE:    'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export default function DashboardClient({
  session,
  initialBookings,
}: {
  session: Session
  initialBookings: any[]
}) {
  const router = useRouter()
  const canSearch = session.role === 'DRIVER' || session.role === 'BOTH'
  const canHost   = session.role === 'HOST'   || session.role === 'BOTH'

  const defaultTab: Tab = canSearch ? 'search' : canHost ? 'listings' : 'bookings'
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab)

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: 'search',   label: 'Find parking', show: canSearch ?? true },
    { id: 'listings', label: 'My listings',  show: canHost   ?? true },
    { id: 'bookings', label: 'My bookings',  show: true },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Hey{session.firstName ? `, ${session.firstName}` : ''} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">What would you like to do today?</p>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 shadow-sm">
          {tabs.filter((t) => t.show).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === t.id
                  ? 'bg-car-neon text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'search' && (canSearch ?? true) && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-car-neon/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-car-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1.5">Find a parking spot</h2>
                <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                  Search by map, address or city and book in seconds.
                </p>
                <button
                  onClick={() => router.push('/search')}
                  className="px-6 py-2.5 bg-car-neon text-white font-medium rounded-lg hover:bg-car-electric transition-colors text-sm shadow-sm"
                >
                  Start searching
                </button>
              </div>
            )}

            {activeTab === 'listings' && (canHost ?? true) && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-car-electric/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-car-electric" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1.5">Manage your listings</h2>
                <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                  List your driveway or garage and start earning.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => router.push('/host/listings')}
                    className="px-5 py-2.5 bg-car-neon text-white font-medium rounded-lg hover:bg-car-electric transition-colors text-sm shadow-sm"
                  >
                    + New listing
                  </button>
                  <button
                    onClick={() => router.push('/host/earnings')}
                    className="px-5 py-2.5 bg-white text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
                  >
                    View earnings
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <BookingsList userId={session.userId} bookings={initialBookings} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function BookingsList({ userId, bookings }: { userId: string; bookings: any[] }) {
  const router = useRouter()

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center">
        <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-500 text-sm mb-4">No bookings yet.</p>
        <button
          onClick={() => router.push('/search')}
          className="px-5 py-2.5 bg-car-neon text-white font-medium rounded-lg hover:bg-car-electric transition-colors text-sm"
        >
          Find parking
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => {
        const isDriver  = userId === booking.driverId
        const otherUser = isDriver ? booking.host : booking.driver
        const status    = booking.status as string

        return (
          <div
            key={booking.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {booking.listing?.title || 'Parking Spot'}
                </h3>
                <p className="text-xs text-gray-500 truncate mt-0.5">{booking.listing?.address}</p>
              </div>
              <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[status] || STATUS_STYLES.COMPLETED}`}>
                {STATUS_LABEL[status] || status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
              <div>
                <p className="text-gray-400 mb-0.5">From</p>
                <p className="text-gray-700 font-medium">{new Date(booking.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-0.5">To</p>
                <p className="text-gray-700 font-medium">{new Date(booking.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-0.5">{isDriver ? 'Host' : 'Driver'}</p>
                <p className="text-gray-700 font-medium">{otherUser?.firstName} {otherUser?.lastName}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-0.5">Total</p>
                <p className="text-gray-900 font-semibold">{formatCurrency(booking.totalAmount)}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/bookings/${booking.id}`)}
                className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                View details
              </button>
              {booking.status === 'COMPLETED' && !booking.driverRating && isDriver && (
                <button
                  onClick={() => router.push(`/bookings/${booking.id}?rate=true`)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-car-neon text-white text-xs font-medium rounded-lg hover:bg-car-electric transition-colors"
                >
                  Leave a rating
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
