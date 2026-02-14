'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import FloatingCard from '@/components/FloatingCard'
import NeonButton from '@/components/NeonButton'
import { formatCurrency } from '@/lib/utils'
import type { Session } from '@/lib/session'

export default function DashboardClient({
  session,
  initialBookings,
}: {
  session: Session
  initialBookings: any[]
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'search' | 'listings' | 'bookings'>('search')

  const canSearch = session.role === 'DRIVER' || session.role === 'BOTH'
  const canHost = session.role === 'HOST' || session.role === 'BOTH'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-gray-200/80 p-2 mb-6 glow-soft">
          <nav className="flex space-x-2">
            {(canSearch ?? true) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('search')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'search'
                    ? 'bg-gradient-to-r from-car-neon to-car-electric text-white shadow-md font-semibold'
                    : 'text-gray-700 hover:text-car-neon hover:bg-gray-50'
                }`}
              >
                Find Parking
              </motion.button>
            )}
            {(canHost ?? true) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('listings')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'listings'
                    ? 'bg-gradient-to-r from-car-neon to-car-electric text-white shadow-md font-semibold'
                    : 'text-gray-700 hover:text-car-neon hover:bg-gray-50'
                }`}
              >
                My Listings
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('bookings')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'bookings'
                  ? 'bg-gradient-to-r from-car-neon to-car-electric text-white shadow-md font-semibold'
                  : 'text-gray-700 hover:text-car-neon hover:bg-gray-50'
              }`}
            >
              My Bookings
            </motion.button>
          </nav>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          {activeTab === 'search' && (canSearch ?? true) && (
            <FloatingCard glowColor="neon">
              <div className="text-center p-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Find Your Perfect Parking Spot</h2>
                <p className="text-gray-600 mb-6">
                  Search for nearby driveways with our interactive map
                </p>
                <motion.button
                  onClick={() => router.push('/search')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-gradient-to-r from-car-neon to-car-electric text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Start Searching
                </motion.button>
              </div>
            </FloatingCard>
          )}

          {activeTab === 'listings' && (canHost ?? true) && (
            <div className="space-y-4">
              <FloatingCard glowColor="electric">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Manage Your Listings</h2>
                <p className="text-gray-600 mb-6">
                  Create and manage your driveway listings to start earning
                </p>
                <div className="flex gap-4">
                  <motion.button
                    onClick={() => router.push('/host/listings')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-car-neon to-car-electric text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    Create New Listing
                  </motion.button>
                  <motion.button
                    onClick={() => router.push('/host/earnings')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 border-2 border-car-electric/50 text-car-electric rounded-lg hover:bg-car-electric/10 transition-all font-semibold"
                  >
                    View Earnings
                  </motion.button>
                </div>
              </FloatingCard>
            </div>
          )}

          {activeTab === 'bookings' && (
            <BookingsList userId={session.userId} bookings={initialBookings} />
          )}
        </motion.div>
      </div>
    </div>
  )
}

function BookingsList({ userId, bookings }: { userId: string; bookings: any[] }) {
  const router = useRouter()

  if (bookings.length === 0) {
    return (
      <FloatingCard glowColor="turbo">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Your Bookings</h2>
        <p className="text-gray-600 mb-6">
          You don&apos;t have any bookings yet
        </p>
        <NeonButton
          variant="primary"
          onClick={() => router.push('/search')}
        >
          Find Parking
        </NeonButton>
      </FloatingCard>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking, idx) => {
        const isDriver = userId === booking.driverId
        const otherUser = isDriver ? booking.host : booking.driver
        const statusColors: Record<string, string> = {
          PENDING: 'bg-yellow-100 text-yellow-800',
          CONFIRMED: 'bg-blue-100 text-blue-800',
          ACTIVE: 'bg-green-100 text-green-800',
          COMPLETED: 'bg-gray-100 text-gray-800',
          CANCELLED: 'bg-red-100 text-red-800',
        }

        return (
          <FloatingCard key={booking.id} glowColor={idx % 3 === 0 ? 'neon' : idx % 3 === 1 ? 'electric' : 'turbo'} delay={0}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {booking.listing?.title || 'Parking Spot'}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  {booking.listing?.address}
                </p>
                <p className="text-sm text-gray-500">
                  {isDriver ? 'Host' : 'Driver'}: {otherUser?.firstName} {otherUser?.lastName}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[booking.status] || 'bg-gray-100 text-gray-800'}`}>
                {booking.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <p className="text-gray-500">Start</p>
                <p className="text-gray-900">
                  {new Date(booking.startTime).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">End</p>
                <p className="text-gray-900">
                  {new Date(booking.endTime).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Vehicle</p>
                <p className="text-gray-900">
                  {booking.vehicleMake} {booking.vehicleModel}
                </p>
                <p className="text-xs text-gray-500">
                  Plate: {booking.licensePlate}{booking.licensePlateState ? ` (${booking.licensePlateState})` : ''}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Amount</p>
                <p className="text-car-electric font-semibold">
                  {formatCurrency(booking.totalAmount)}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <NeonButton
                variant="outline"
                onClick={() => router.push(`/bookings/${booking.id}`)}
                className="flex-1 text-sm"
              >
                View Details
              </NeonButton>
              {booking.status === 'COMPLETED' && !booking.driverRating && isDriver && (
                <NeonButton
                  variant="primary"
                  onClick={() => router.push(`/bookings/${booking.id}?rate=true`)}
                  className="flex-1 text-sm"
                >
                  Rate
                </NeonButton>
              )}
            </div>
          </FloatingCard>
        )
      })}
    </div>
  )
}
