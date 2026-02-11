import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

// GET blocked dates for a listing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const blockedDates = await prisma.blockedDate.findMany({
      where: { listingId: id },
      orderBy: { startDate: 'asc' },
    })

    return NextResponse.json({ blockedDates })
  } catch (error) {
    console.error('Get blocked dates error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create blocked date
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const listing = await prisma.listing.findUnique({
      where: { id },
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (listing.hostId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { startDate, endDate, reason } = body

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date required' },
        { status: 400 }
      )
    }

    // Check for conflicting bookings - optimized query
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        listingId: id,
        status: {
          in: ['CONFIRMED', 'ACTIVE'],
        },
        AND: [
          { startTime: { lt: new Date(endDate) } },
          { endTime: { gt: new Date(startDate) } },
        ],
      },
      select: { id: true }, // Only select id for performance
    })

    if (conflictingBooking) {
      return NextResponse.json(
        { error: 'Cannot block dates with existing bookings' },
        { status: 400 }
      )
    }

    const blockedDate = await prisma.blockedDate.create({
      data: {
        listingId: id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
      },
    })

    return NextResponse.json({ blockedDate })
  } catch (error) {
    console.error('Create blocked date error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove blocked date
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const blockedDateId = searchParams.get('blockedDateId')

    if (!blockedDateId) {
      return NextResponse.json(
        { error: 'Blocked date ID required' },
        { status: 400 }
      )
    }

    const blockedDate = await prisma.blockedDate.findUnique({
      where: { id: blockedDateId },
      include: { listing: true },
    })

    if (!blockedDate) {
      return NextResponse.json(
        { error: 'Blocked date not found' },
        { status: 404 }
      )
    }

    if (blockedDate.listing.hostId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.blockedDate.delete({
      where: { id: blockedDateId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete blocked date error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

