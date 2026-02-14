import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listingId } = await params
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, hostId: true, title: true },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const withUserId = searchParams.get('with')

    let otherUserId: string
    if (listing.hostId === session.userId) {
      if (!withUserId) {
        return NextResponse.json(
          { error: 'Host must specify ?with=driverId to view a thread' },
          { status: 400 }
        )
      }
      otherUserId = withUserId
    } else {
      // Driver: thread is always with the host
      otherUserId = listing.hostId
      if (withUserId && withUserId !== listing.hostId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const messages = await prisma.message.findMany({
      where: {
        listingId,
        senderId: { in: [session.userId, otherUserId] },
        receiverId: { in: [session.userId, otherUserId] },
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    await prisma.message.updateMany({
      where: {
        listingId,
        receiverId: session.userId,
        isRead: false,
      },
      data: { isRead: true },
    })

    return NextResponse.json({
      messages,
      listing: { id: listing.id, title: listing.title, hostId: listing.hostId },
      otherUserId,
    })
  } catch (error) {
    console.error('Get listing messages error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
