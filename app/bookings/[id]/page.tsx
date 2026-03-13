'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { formatCurrency, parseResponseJson } from '@/lib/utils'
import type { Booking } from '@/types'
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
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const attachInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [extending, setExtending] = useState(false)
  const [newEndTime, setNewEndTime] = useState('')
  const [showRating, setShowRating] = useState(false)
  const [alreadyRated, setAlreadyRated] = useState(false)
  const [rating, setRating] = useState({ stars: 0, comment: '' })
  const [submittingRating, setSubmittingRating] = useState(false)
  const [licenseVerified, setLicenseVerified] = useState(false)

  const fetchBooking = useCallback(async () => {
    try {
      const res = await fetch(`/api/bookings/${params.id}`)
      const data = await parseResponseJson<{ booking?: Booking; error?: string }>(res)

      if (!res.ok) {
        alert(data?.error || 'Booking not found')
        router.push('/dashboard')
        return
      }

      setBooking(data.booking)
      // Check if current user has already rated this booking
      const userHasRated = data.booking?.ratings?.some((r: any) => r.giverId === user?.userId)
      setAlreadyRated(!!userHasRated)
      if (userHasRated) setShowRating(false)
    } catch (error) {
      console.error('Error fetching booking:', error)
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  useEffect(() => {
    fetchBooking()
    if (searchParams.get('rate') === 'true') {
      setShowRating(true)
    }
  }, [params.id, searchParams, fetchBooking])

  const sendMessage = async () => {
    if (!message.trim() && !imagePreview) return

    setSendingMessage(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          content: message.trim() || '',
          ...(imagePreview && { imageUrl: imagePreview }),
        }),
      })

      if (!res.ok) {
        const data = await parseResponseJson<{ error?: string }>(res)
        alert(data?.error || 'Failed to send message')
        return
      }

      setMessage('')
      setImagePreview(null)
      fetchBooking()
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please select an image (JPEG, PNG, WebP, or GIF)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB')
      return
    }
    setUploadingImage(true)
    setImagePreview(null)
    try {
      const formData = new FormData()
      formData.append('type', 'message')
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await parseResponseJson<{ url?: string; error?: string }>(res)
      if (res.ok && data.url) {
        setImagePreview(data.url)
      } else {
        alert(data?.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed')
    } finally {
      setUploadingImage(false)
      e.target.value = ''
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

      setShowRating(false)
      setAlreadyRated(true)
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-6 text-car-neon hover:text-car-electric transition-colors font-medium"
        >
          ← Back to Dashboard
        </button>

        <FloatingCard glowColor="neon" className="mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900">{booking.listing.title}</h1>
              <p className="text-gray-600">{booking.listing.address}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${statusColors[booking.status] || statusColors.PENDING}`}>
              {booking.status}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Parking Period</p>
              <p className="text-gray-900 font-semibold">
                {new Date(booking.startTime).toLocaleString()}
              </p>
              <p className="text-gray-700">
                to {new Date(booking.endTime).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-car-neon">
                {formatCurrency(booking.totalAmount)}
              </p>
              {booking.payment && (
                <p className="text-xs text-gray-400 mt-1">
                  Payment: {booking.payment.status}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Vehicle</p>
              <p className="text-gray-900 font-semibold">
                {booking.vehicleMake} {booking.vehicleModel}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-600">
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
              <p className="text-sm text-gray-500 mb-1">Contact</p>
              <p className="text-gray-900 font-semibold">
                {otherUser.firstName} {otherUser.lastName}
              </p>
              <p className="text-sm text-gray-600">{otherUser.email}</p>
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
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold mb-3 text-gray-900">Extend Booking</h3>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  min={new Date(booking.endTime).toISOString().slice(0, 16)}
                  className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900"
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
          {booking.status === 'COMPLETED' && (
            <div className="mb-6">
              {alreadyRated ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm font-medium">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  You&apos;ve already rated this booking. Thank you for your feedback!
                </div>
              ) : !showRating ? (
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
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <h3 className="font-semibold mb-3 text-gray-900">Rate Your Experience</h3>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Rating</p>
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
                    <label className="block text-sm text-gray-600 mb-2">Comment (Optional)</label>
                    <textarea
                      value={rating.comment}
                      onChange={(e) => setRating({ ...rating, comment: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500"
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
        <FloatingCard glowColor="turbo">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Messages</h2>

          <div
            id="messages"
            className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 space-y-3 bg-gray-50"
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
                          ? 'bg-car-neon/10 text-gray-900 border border-car-neon/30'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                    <p className="text-xs mb-1 opacity-75">
                      {msg.sender.firstName} {msg.sender.lastName}
                    </p>
                    {msg.imageUrl && (
                      <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer" className="block mb-2 rounded overflow-hidden max-w-[200px]">
                        <Image
                          src={msg.imageUrl}
                          alt="Shared"
                          width={200}
                          height={200}
                          className="max-h-[200px] object-cover rounded"
                        />
                      </a>
                    )}
                    {msg.content ? <p>{msg.content}</p> : null}
                    <p className="text-xs mt-1 opacity-75">
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No messages yet</p>
            )}
          </div>

          {imagePreview && (
            <div className="mb-4 relative inline-block">
              <Image
                src={imagePreview}
                alt="Preview"
                width={96}
                height={96}
                className="max-h-24 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500/90 text-white text-sm flex items-center justify-center hover:bg-red-500"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          )}
          <div className="flex gap-2 items-center">
            <input
              ref={attachInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => attachInputRef.current?.click()}
              disabled={uploadingImage}
              className="p-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              title="Attach image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={uploadingImage}
              className="p-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              title="Take photo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7" />
              </svg>
            </button>
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
              className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-car-neon focus:border-car-neon"
            />
            <NeonButton
              variant="primary"
              onClick={sendMessage}
              disabled={sendingMessage || uploadingImage || (!message.trim() && !imagePreview)}
            >
              {sendingMessage ? 'Sending...' : uploadingImage ? 'Uploading...' : 'Send'}
            </NeonButton>
          </div>
        </FloatingCard>
      </div>
    </div>
  )
}
