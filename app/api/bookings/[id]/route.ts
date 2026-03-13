import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { calculateBookingPrice } from '@/lib/utils'
import { validateBookingDates, validateEnum, ALLOWED_BOOKING_STATUSES } from '@/lib/validation'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        listing: true,
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        payment: true,
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        ratings: true,
      },
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

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Get booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
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

    const { status, endTime } = body

    // Allow extending booking end time (driver only)
    if (endTime && booking.driverId === session.userId) {
      const dateValidation = validateBookingDates(booking.startTime, endTime)
      if (!dateValidation.valid) {
        return NextResponse.json(
          { error: dateValidation.error },
          { status: 400 }
        )
      }

      const listing = await prisma.listing.findUnique({
        where: { id: booking.listingId },
      })

      if (!listing) {
        return NextResponse.json(
          { error: 'Listing not found' },
          { status: 404 }
        )
      }

      const newEndTime = new Date(endTime)
      const newTotalAmount = calculateBookingPrice(
        booking.startTime,
        newEndTime,
        listing.pricePerHour,
        listing.pricePerDay
      )

      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          endTime: newEndTime,
          totalAmount: newTotalAmount,
        },
      })

      return NextResponse.json({ booking: updatedBooking })
    }

    // Allow status updates — validate against allowed enum values
    if (status) {
      if (!validateEnum(status, ALLOWED_BOOKING_STATUSES)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${ALLOWED_BOOKING_STATUSES.join(', ')}` },
          { status: 400 }
        )
      }

      // Enforce permission rules per status
      if (status === 'CONFIRMED' || status === 'ACTIVE' || status === 'COMPLETED') {
        if (booking.hostId !== session.userId) {
          return NextResponse.json({ error: 'Only the host can set this status' }, { status: 403 })
        }
      }

      if (status === 'CANCELLED') {
        if (booking.driverId !== session.userId && booking.hostId !== session.userId) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
      }

      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: { status },
      })

      return NextResponse.json({ booking: updatedBooking })
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
