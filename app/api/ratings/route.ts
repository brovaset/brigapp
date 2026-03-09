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
        giverId: session.userId,
      },
    })

    if (existingRating) {
      return NextResponse.json(
        { error: 'You have already rated this booking' },
        { status: 400 }
      )
    }

    // Create rating - supports both driver and host rating the same booking
    const newRating = await prisma.rating.create({
      data: {
        bookingId,
        driverId: booking.driverId,
        hostId: booking.hostId,
        giverId: session.userId, // Track who gave the rating
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

