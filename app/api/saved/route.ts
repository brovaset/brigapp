import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')

    if (listingId) {
      const saved = await prisma.savedListing.findUnique({
        where: {
          userId_listingId: {
            userId: session.userId,
            listingId,
          },
        },
      })
      return NextResponse.json({ saved: !!saved })
    }

    const saved = await prisma.savedListing.findMany({
      where: { userId: session.userId },
      include: {
        listing: {
          include: {
            host: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            ratings: { select: { rating: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const listings = saved.map((s) => {
      const l = s.listing as any
      const avgRating =
        l.ratings?.length > 0
          ? l.ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / l.ratings.length
          : 0
      return {
        ...l,
        averageRating: avgRating,
        ratingCount: l.ratings?.length || 0,
        ratings: undefined,
        photos: typeof l.photos === 'string' ? (() => {
          try { return JSON.parse(l.photos) } catch { return [] }
        })() : l.photos,
      }
    })

    return NextResponse.json({ listings })
  } catch (error) {
    console.error('Get saved listings error:', error)
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

    const body = await request.json()
    const { listingId } = body

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID required' },
        { status: 400 }
      )
    }

    await prisma.savedListing.upsert({
      where: {
        userId_listingId: {
          userId: session.userId,
          listingId,
        },
      },
      create: {
        userId: session.userId,
        listingId,
      },
      update: {},
    })

    return NextResponse.json({ saved: true })
  } catch (error) {
    console.error('Save listing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID required' },
        { status: 400 }
      )
    }

    await prisma.savedListing.deleteMany({
      where: {
        userId: session.userId,
        listingId,
      },
    })

    return NextResponse.json({ removed: true })
  } catch (error) {
    console.error('Remove saved listing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
