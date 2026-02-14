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

    const { bookingId, listingId, content, imageUrl } = body

    const sanitizedContent = content != null ? sanitizeString(String(content)) : ''
    const hasImage = imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('/uploads/messages/')
    if (!hasImage && sanitizedContent.length === 0) {
      return NextResponse.json(
        { error: 'Message content or image required' },
        { status: 400 }
      )
    }

    if (sanitizedContent.length > 1000) {
      return NextResponse.json(
        { error: 'Message content too long (max 1000 characters)' },
        { status: 400 }
      )
    }

    let receiverId: string
    let createData: { bookingId?: string; listingId?: string; senderId: string; receiverId: string; content: string; imageUrl?: string }

    if (bookingId) {
      const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      }
      if (booking.driverId !== session.userId && booking.hostId !== session.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      receiverId = booking.driverId === session.userId ? booking.hostId : booking.driverId
      createData = { bookingId, senderId: session.userId, receiverId, content: sanitizedContent, imageUrl: hasImage ? imageUrl : undefined }
    } else if (listingId) {
      const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { hostId: true } })
      if (!listing) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
      }
      if (listing.hostId === session.userId) {
        const driverId = body.receiverId
        if (!driverId) {
          return NextResponse.json({ error: 'Host reply requires receiverId (driver)' }, { status: 400 })
        }
        receiverId = driverId
      } else {
        receiverId = listing.hostId
      }
      createData = { listingId, senderId: session.userId, receiverId, content: sanitizedContent, imageUrl: hasImage ? imageUrl : undefined }
    } else {
      return NextResponse.json(
        { error: 'Booking ID or Listing ID required' },
        { status: 400 }
      )
    }

    const message = await prisma.message.create({
      data: createData,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Create message error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

