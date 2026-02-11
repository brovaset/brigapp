'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { formatCurrency, parseResponseJson } from '@/lib/utils'
import AnimatedBackground from '@/components/AnimatedBackground'
import FloatingCard from '@/components/FloatingCard'
import NeonButton from '@/components/NeonButton'
import { motion } from 'framer-motion'

export default function BookingDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [extending, setExtending] = useState(false)
  const [newEndTime, setNewEndTime] = useState('')
  const [showRating, setShowRating] = useState(false)
  const [rating, setRating] = useState({ stars: 0, comment: '' })
  const [submittingRating, setSubmittingRating] = useState(false)
  const [licenseVerified, setLicenseVerified] = useState(false)

  useEffect(() => {
    fetchBooking()
    if (searchParams.get('rate') === 'true') {
      setShowRating(true)
    }
  }, [params.id, searchParams])

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${params.id}`)
      const data = await parseResponseJson<{ booking?: unknown; error?: string }>(res)

      if (!res.ok) {
        alert(data?.error || 'Booking not found')
        router.push('/dashboard')
        return
      }

      setBooking(data.booking)
      // Check if rating already exists
      if (data.booking.driverRating || data.booking.hostRating) {
        setShowRating(false)
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!message.trim()) return

    setSendingMessage(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          content: message,
        }),
      })

      if (!res.ok) {
        alert('Failed to send message')
        return
      }

      setMessage('')
      fetchBooking()
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  const extendBooking = async () => {
    if (!newEndTime) {
      alert('Please select a new end time')
      return
    }

    setExtending(true)
    try {
      const res = await fetch(`/api/bookings/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endTime: newEndTime,
        }),
      })

      const data = await parseResponseJson<{ error?: string }>(res)

      if (!res.ok) {
        alert(data?.error || 'Failed to extend booking')
        return
      }

      alert('Booking extended successfully! Additional charges will apply.')
      setNewEndTime('')
      fetchBooking()
    } catch (error) {
      console.error('Error extending booking:', error)
      alert('Failed to extend booking')
    } finally {
      setExtending(false)
    }
  }

  const updateBookingStatus = async (status: string) => {
    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this booking?`)) {
      return
    }

    try {
      const res = await fetch(`/api/bookings/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        alert('Failed to update booking status')
        return
      }

      fetchBooking()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update booking status')
    }
  }

  const submitRating = async () => {
    if (rating.stars < 1 || rating.stars > 5) {
      alert('Please select a rating between 1 and 5 stars')
      return
    }

    setSubmittingRating(true)
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          rating: rating.stars,
          comment: rating.comment,
        }),
      })

      if (!res.ok) {
        alert('Failed to submit rating')
        return
      }

      alert('Thank you for your rating!')
      setShowRating(false)
      setRating({ stars: 0, comment: '' })
      fetchBooking()
    } catch (error) {
      console.error('Error submitting rating:', error)
      alert('Failed to submit rating')
    } finally {
      setSubmittingRating(false)
    }
  }

  const verifyLicensePlate = () => {
    const enteredPlate = prompt(
      `Enter the license plate to verify:\nExpected: ${booking.licensePlate}${booking.licensePlateState ? ` (${booking.licensePlateState})` : ''}`
    )
    
    if (enteredPlate?.toUpperCase().trim() === booking.licensePlate.toUpperCase().trim()) {
      setLicenseVerified(true)
      alert('License plate verified!')
    } else if (enteredPlate) {
      alert('License plate does not match!')
    }
  }

  const navigateToLocation = (provider: 'google' | 'waze' = 'google') => {
    if (!booking?.listing) return

    const { latitude, longitude } = booking.listing
    let url = ''

    if (provider === 'waze') {
      url = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    }

    window.open(url, '_blank')
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

  const isDriver = user?.userId === booking.driverId
  const isHost = user?.userId === booking.hostId
  const otherUser = isDriver ? booking.host : booking.driver
  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    CONFIRMED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
    COMPLETED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-6 text-neon-cyan hover:text-neon-pink transition-colors"
        >
          ← Back to Dashboard
        </button>

        <FloatingCard glowColor="cyan" className="mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-white">{booking.listing.title}</h1>
              <p className="text-gray-300">{booking.listing.address}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${statusColors[booking.status] || statusColors.PENDING}`}>
              {booking.status}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">Parking Period</p>
              <p className="text-white font-semibold">
                {new Date(booking.startTime).toLocaleString()}
              </p>
              <p className="text-white">
                to {new Date(booking.endTime).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-neon-cyan">
                {formatCurrency(booking.totalAmount)}
              </p>
              {booking.payment && (
                <p className="text-xs text-gray-400 mt-1">
                  Payment: {booking.payment.status}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Vehicle</p>
              <p className="text-white font-semibold">
                {booking.vehicleMake} {booking.vehicleModel}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-300">
                  License: {booking.licensePlate}{booking.licensePlateState ? ` (${booking.licensePlateState})` : ''}
                </p>
                {isHost && booking.status === 'ACTIVE' && (
                  <button
                    onClick={verifyLicensePlate}
                    className={`px-2 py-1 text-xs rounded ${
                      licenseVerified
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                    }`}
                  >
                    {licenseVerified ? 'Verified' : 'Verify'}
                  </button>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Contact</p>
              <p className="text-white font-semibold">
                {otherUser.firstName} {otherUser.lastName}
              </p>
              <p className="text-sm text-gray-300">{otherUser.email}</p>
            </div>
          </div>

          {/* Navigation Buttons */}
          {isDriver && booking.status !== 'CANCELLED' && (
            <div className="flex gap-2 mb-6">
              <NeonButton
                variant="outline"
                onClick={() => navigateToLocation('google')}
                className="flex-1"
              >
                Google Maps
              </NeonButton>
              <NeonButton
                variant="outline"
                onClick={() => navigateToLocation('waze')}
                className="flex-1"
              >
                Waze
              </NeonButton>
            </div>
          )}

          {/* Host Actions */}
          {isHost && booking.status === 'PENDING' && (
            <div className="flex gap-2 mb-6">
              <NeonButton
                variant="primary"
                onClick={() => updateBookingStatus('CONFIRMED')}
                className="flex-1"
              >
                Confirm Booking
              </NeonButton>
              <NeonButton
                variant="outline"
                onClick={() => updateBookingStatus('CANCELLED')}
                className="flex-1"
              >
                Cancel
              </NeonButton>
            </div>
          )}

          {/* Driver Actions */}
          {isDriver && booking.status === 'ACTIVE' && (
            <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <h3 className="font-semibold mb-3 text-white">Extend Booking</h3>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  min={new Date(booking.endTime).toISOString().slice(0, 16)}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                />
                <NeonButton
                  variant="primary"
                  onClick={extendBooking}
                  disabled={extending || !newEndTime}
                >
                  {extending ? 'Extending...' : 'Extend'}
                </NeonButton>
              </div>
            </div>
          )}

          {/* Rating Section */}
          {booking.status === 'COMPLETED' && !booking.driverRating && !booking.hostRating && (
            <div className="mb-6">
              {!showRating ? (
                <NeonButton
                  variant="secondary"
                  onClick={() => setShowRating(true)}
                  className="w-full"
                >
                  Rate This Booking
                </NeonButton>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <h3 className="font-semibold mb-3 text-white">Rate Your Experience</h3>
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">Rating</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating({ ...rating, stars: star })}
                          className={`text-3xl ${
                            star <= rating.stars
                              ? 'text-yellow-400'
                              : 'text-gray-500 hover:text-yellow-400'
                          } transition-colors`}
                        >
                          <svg className="w-8 h-8" viewBox="0 0 20 20" fill={star <= rating.stars ? 'currentColor' : 'none'} stroke="currentColor"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">Comment (Optional)</label>
                    <textarea
                      value={rating.comment}
                      onChange={(e) => setRating({ ...rating, comment: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400"
                      rows={3}
                      placeholder="Share your experience..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <NeonButton
                      variant="outline"
                      onClick={() => {
                        setShowRating(false)
                        setRating({ stars: 0, comment: '' })
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </NeonButton>
                    <NeonButton
                      variant="primary"
                      onClick={submitRating}
                      disabled={submittingRating || rating.stars === 0}
                      className="flex-1"
                    >
                      {submittingRating ? 'Submitting...' : 'Submit Rating'}
                    </NeonButton>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </FloatingCard>

        {/* Messages */}
        <FloatingCard glowColor="purple">
          <h2 className="text-2xl font-bold mb-4 text-white">Messages</h2>

          <div
            id="messages"
            className="h-64 overflow-y-auto border border-white/10 rounded-lg p-4 mb-4 space-y-3 bg-black/20"
          >
            {booking.messages && booking.messages.length > 0 ? (
              booking.messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.senderId === user?.userId ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs rounded-lg p-3 ${
                      msg.senderId === user?.userId
                        ? 'bg-neon-cyan/20 text-white border border-neon-cyan/30'
                        : 'bg-white/5 text-gray-300 border border-white/10'
                    }`}
                  >
                    <p className="text-xs mb-1 opacity-75">
                      {msg.sender.firstName} {msg.sender.lastName}
                    </p>
                    <p>{msg.content}</p>
                    <p className="text-xs mt-1 opacity-75">
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">No messages yet</p>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan"
            />
            <NeonButton
              variant="primary"
              onClick={sendMessage}
              disabled={sendingMessage || !message.trim()}
            >
              {sendingMessage ? 'Sending...' : 'Send'}
            </NeonButton>
          </div>
        </FloatingCard>
      </div>
    </div>
  )
}
