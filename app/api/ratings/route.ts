import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { sanitizeString } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { bookingId, rating, comment } = body

    if (!bookingId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Valid booking ID and rating (1-5) required' },
        { status: 400 }
      )
    }

    // Validate and sanitize comment if provided
    const sanitizedComment = comment ? sanitizeString(comment) : null
    if (sanitizedComment && sanitizedComment.length > 500) {
      return NextResponse.json(
        { error: 'Comment too long (max 500 characters)' },
        { status: 400 }
      )
    }

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (booking.driverId !== session.userId && booking.hostId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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
        OR: [
          // If driver is rating, check if driver has already rated
          ...(isDriver ? [{ driverId: session.userId }] : []),
          // If host is rating, check if host has already rated
          ...(isHost ? [{ hostId: session.userId }] : []),
        ],
      },
    })

    if (existingRating) {
      return NextResponse.json(
        { error: 'You have already rated this booking' },
        { status: 400 }
      )
    }

    // Create rating
    // Note: The schema has bookingId as unique, so we'll use one rating record
    // but track who gave the rating. For true two-way ratings, the schema would need
    // to be updated to allow multiple ratings per booking.
    const newRating = await prisma.rating.create({
      data: {
        bookingId,
        driverId: booking.driverId,
        hostId: booking.hostId,
        listingId: booking.listingId,
        rating: Number(rating),
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

