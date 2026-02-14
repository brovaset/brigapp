'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { parseResponseJson } from '@/lib/utils'
import FloatingCard from '@/components/FloatingCard'
import { motion } from 'framer-motion'

type InquiryThread = {
  listingId: string
  listingTitle: string
  hostId: string
  otherUserId: string
  otherUser: { id: string; firstName: string; lastName: string }
  lastMessage: { content: string | null; imageUrl: string | null; createdAt: string }
  unreadCount: number
}

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [inquiries, setInquiries] = useState<InquiryThread[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (user) {
      Promise.all([fetchBookings(), fetchInquiries()])
        .then(() => setLoading(false))
        .catch((err: unknown) => {
          console.error('Messages fetch error:', err ?? 'Unknown error')
          setLoading(false)
        })
    }
  }, [user, authLoading, router])

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings')
      const data = await parseResponseJson<{ bookings?: unknown[] }>(res)
      if (data?.bookings) {
        setBookings(data.bookings)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  const fetchInquiries = async () => {
    try {
      const res = await fetch('/api/messages/inquiries')
      const data = await parseResponseJson<{ threads?: InquiryThread[] }>(res)
      if (data?.threads) {
        setInquiries(data.threads)
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-car-neon border-t-transparent"></div>
          <p className="text-gray-600 text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-car-neon border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Messages</h1>
        <p className="text-gray-600 mb-8">
          Your conversations with hosts and drivers
        </p>

        {inquiries.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Inquiries (before booking)</h2>
            <div className="space-y-4">
              {inquiries.map((thread, idx) => {
                const isHost = user?.userId === thread.hostId
                const href = isHost
                  ? `/listings/${thread.listingId}/message?with=${encodeURIComponent(thread.otherUserId)}`
                  : `/listings/${thread.listingId}/message`
                const roleLabel = isHost ? 'Driver' : 'Host'
                return (
                  <motion.div
                    key={`${thread.listingId}:${thread.otherUserId}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link href={href}>
                      <FloatingCard glowColor="turbo" className="hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {thread.listingTitle}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {thread.otherUser.firstName} {thread.otherUser.lastName} ({roleLabel})
                            </p>
                            {thread.lastMessage && (
                              <p className="text-sm text-gray-500 mt-2 truncate max-w-md">
                                {thread.lastMessage.imageUrl ? 'Photo' : (thread.lastMessage.content ?? '')}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            {thread.unreadCount > 0 && (
                              <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-medium bg-car-neon text-white">
                                {thread.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </FloatingCard>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {bookings.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking conversations</h2>
            <div className="space-y-4">
            {bookings.map((booking, idx) => {
              const isDriver = user?.userId === booking.driverId
              const otherUser = isDriver ? booking.host : booking.driver
              const messageCount = booking.messages?.length ?? 0
              const lastMessage = booking.messages?.length
                ? booking.messages[booking.messages.length - 1]
                : null

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link href={`/bookings/${booking.id}`}>
                    <FloatingCard glowColor="purple" className="hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {booking.listing?.title || 'Parking Spot'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {otherUser?.firstName} {otherUser?.lastName}
                            {isDriver ? ' (Host)' : ' (Driver)'}
                          </p>
                          {lastMessage && (
                            <p className="text-sm text-gray-500 mt-2 truncate max-w-md">
                              {lastMessage.imageUrl ? 'Photo' : (lastMessage.content ?? '')}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-car-turbo/20 text-car-turbo">
                            {booking.status}
                          </span>
                          {messageCount > 0 && (
                            <p className="text-xs text-gray-500 mt-2">
                              {messageCount} message{messageCount !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </FloatingCard>
                  </Link>
                </motion.div>
              )
            })}
            </div>
          </>
        )}

        {bookings.length === 0 && inquiries.length === 0 && (
          <FloatingCard glowColor="purple">
            <div className="text-center py-12">
              <p className="text-gray-600 mb-6">
                You don't have any conversations yet. Message a host from a listing or start a booking.
              </p>
              <Link
                href="/search"
                className="inline-block px-6 py-3 bg-gradient-to-r from-car-neon to-car-electric text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Find Parking
              </Link>
            </div>
          </FloatingCard>
        )}
      </div>
    </div>
  )
}
