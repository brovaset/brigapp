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

export default function MessagesPageClient() {
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
  }, [authLoading, user, router])

  useEffect(() => {
    const run = async () => {
      try {
        await Promise.all([fetchBookings(), fetchInquiries()])
      } catch (err) {
        console.error('Messages fetch error:', err ?? 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const fetchBookings = async () => {
    const res = await fetch('/api/bookings', { credentials: 'include' })
    if (res.status === 401) {
      router.push('/login')
      return
    }
    const data = await parseResponseJson<{ bookings?: unknown[] }>(res)
    if (data?.bookings) {
      setBookings(data.bookings)
    }
  }

  const fetchInquiries = async () => {
    const res = await fetch('/api/messages/inquiries', { credentials: 'include' })
    if (res.status === 401) {
      router.push('/login')
      return
    }
    const data = await parseResponseJson<{ threads?: InquiryThread[] }>(res)
    if (data?.threads) {
      setInquiries(data.threads)
    }
  }

  if (!authLoading && !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Messages</h1>
        <p className="text-gray-600 mb-8">
          Your conversations with hosts and drivers
        </p>

        {loading && !bookings.length && !inquiries.length && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-car-neon border-t-transparent"></div>
          </div>
        )}

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
              const messageCount = (booking as { _count?: { messages: number } })._count?.messages ?? 0
              const lastMessage = booking.messages?.[0] ?? null

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

        {!loading && bookings.length === 0 && inquiries.length === 0 && (
          <FloatingCard glowColor="purple">
            <div className="text-center py-12">
              <p className="text-gray-600 mb-6">
                You don&apos;t have any conversations yet. Message a host from a listing or start a booking.
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
