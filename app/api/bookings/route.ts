import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { calculateBookingPrice } from '@/lib/utils'
import { validateBookingDates, validateLicensePlate, sanitizeString } from '@/lib/validation'
import { ValidationError, handleApiError } from '@/lib/errors'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { driverId: session.userId },
          { hostId: session.userId },
        ],
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            photos: true,
          },
        },
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const {
      listingId,
      startTime,
      endTime,
      vehicleMake,
      vehicleModel,
      licensePlate,
      licensePlateState,
    } = body

    if (
      !listingId ||
      !startTime ||
      !endTime ||
      !vehicleMake ||
      !vehicleModel ||
      !licensePlate
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate dates
    const dateValidation = validateBookingDates(startTime, endTime)
    if (!dateValidation.valid) {
      return NextResponse.json(
        { error: dateValidation.error },
        { status: 400 }
      )
    }

    // Validate license plate
    if (!validateLicensePlate(licensePlate)) {
      return NextResponse.json(
        { error: 'Invalid license plate format' },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedMake = sanitizeString(vehicleMake)
    const sanitizedModel = sanitizeString(vehicleModel)
    const sanitizedPlate = licensePlate.trim().toUpperCase()

    // Get listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (listing.hostId === session.userId) {
      return NextResponse.json(
        { error: 'Cannot book your own listing' },
        { status: 400 }
      )
    }

    // Check for blocked dates
    const blockedDates = await prisma.blockedDate.findMany({
      where: {
        listingId,
        OR: [
          {
            AND: [
              { startDate: { lte: new Date(endTime) } },
              { endDate: { gte: new Date(startTime) } },
            ],
          },
        ],
      },
    })

    if (blockedDates.length > 0) {
      return NextResponse.json(
        { error: 'Selected dates are blocked by the host' },
        { status: 400 }
      )
    }

    // Check for conflicts - optimized query
    // Check if new booking overlaps with any existing confirmed/active bookings
    const conflictingBookings = await prisma.booking.findFirst({
      where: {
        listingId,
        status: {
          in: ['CONFIRMED', 'ACTIVE'],
        },
        AND: [
          { startTime: { lt: new Date(endTime) } },
          { endTime: { gt: new Date(startTime) } },
        ],
      },
      select: { id: true }, // Only select id for performance
    })

    if (conflictingBookings) {
      return NextResponse.json(
        { error: 'Time slot already booked' },
        { status: 400 }
      )
    }

    // Calculate price
    const totalAmount = calculateBookingPrice(
      new Date(startTime),
      new Date(endTime),
      listing.pricePerHour,
      listing.pricePerDay
    )

    // Sanitize license plate state (optional)
    const sanitizedState =
      licensePlateState && typeof licensePlateState === 'string'
        ? licensePlateState.trim().toUpperCase().slice(0, 2)
        : null

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        driverId: session.userId,
        listingId,
        hostId: listing.hostId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        vehicleMake: sanitizedMake,
        vehicleModel: sanitizedModel,
        licensePlate: sanitizedPlate,
        licensePlateState: sanitizedState || undefined,
        totalAmount,
        status: 'PENDING',
      },
      include: {
        listing: true,
        host: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Create booking error:', error)
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

