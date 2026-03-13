import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { sanitizeStringMax, validateNumber } from '@/lib/validation'
import { rateLimit, LIMITS, rateLimitExceeded } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(request, LIMITS.ratings, 'write:ratings')
    if (rl.limited) return rateLimitExceeded(rl.resetAt)

    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    const { bookingId, rating, comment } = body

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 })
    }

    // Validate rating (1–5 integer)
    const ratingValue = validateNumber(rating, 1, 5)
    if (ratingValue == null) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      )
    }
    const ratingInt = Math.round(ratingValue)

    // Sanitize optional comment
    const sanitizedComment = sanitizeStringMax(comment, 1000)

    // Get booking and verify participant
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Can only rate completed bookings' },
        { status: 400 }
      )
    }

    // Determine who is rating whom
    const isDriver = booking.driverId === session.userId
    const isHost = booking.hostId === session.userId

    if (!isDriver && !isHost) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if this user has already rated this booking
    const existingRating = await prisma.rating.findFirst({
      where: {
        bookingId,
        giverId: session.userId,
      },
    })

    if (existingRating) {
      return NextResponse.json(
        { error: 'You have already rated this booking' },
        { status: 400 }
      )
    }

    // Create rating — supports both driver and host rating the same booking
    const newRating = await prisma.rating.create({
      data: {
        bookingId,
        driverId: booking.driverId,
        hostId: booking.hostId,
        giverId: session.userId,
        listingId: booking.listingId,
        rating: ratingInt,
        comment: sanitizedComment,
      },
    })

    return NextResponse.json({ rating: newRating })
  } catch (error) {
    console.error('Create rating error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
