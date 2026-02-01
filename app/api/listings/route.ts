import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { calculateDistance } from '@/lib/utils'

function parsePhotos(photos: string | undefined): string[] {
  if (!photos) return []
  try {
    const p = JSON.parse(photos)
    return Array.isArray(p) ? p : []
  } catch {
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius') || '10' // km
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const includeBlockedDates = !!(startDate && endDate)
    let listings = await prisma.listing.findMany({
      where: { isActive: true },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        ratings: {
          select: {
            rating: true,
          },
        },
        ...(includeBlockedDates && { blockedDates: true }),
      },
    })

    // Filter by availability if dates provided
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      listings = listings.filter((listing: any) => {
        const blocked = listing.blockedDates || []
        const hasConflict = blocked.some(
          (b: any) =>
            new Date(b.startDate) <= end && new Date(b.endDate) >= start
        )
        return !hasConflict
      })
      listings = listings.map(({ blockedDates, ...l }: any) => l)
    }

    // Filter by distance if coordinates provided
    if (lat && lng) {
      const userLat = parseFloat(lat)
      const userLng = parseFloat(lng)
      const radiusKm = parseFloat(radius)

      listings = listings.filter(listing => {
        const distance = calculateDistance(userLat, userLng, listing.latitude, listing.longitude)
        return distance <= radiusKm
      })
    }

    // Calculate average ratings
    const listingsWithRatings = listings.map(listing => {
      const avgRating =
        listing.ratings.length > 0
          ? listing.ratings.reduce((sum, r) => sum + r.rating, 0) / listing.ratings.length
          : 0

      return {
        ...listing,
        photos: parsePhotos(listing.photos),
        averageRating: avgRating,
        ratingCount: listing.ratings.length,
        ratings: undefined,
      }
    })

    return NextResponse.json({ listings: listingsWithRatings })
  } catch (error) {
    console.error('Get listings error:', error)
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
    const {
      title,
      description,
      address,
      city,
      state,
      zipCode,
      latitude,
      longitude,
      pricePerHour,
      pricePerDay,
      maxVehicleSize,
      photos,
      entryInstructions,
      amenities,
      instantBook,
      cancellationPolicy,
      houseRules,
    } = body

    if (
      !title ||
      !description ||
      !address ||
      !city ||
      !state ||
      !zipCode ||
      !latitude ||
      !longitude ||
      !pricePerHour ||
      !pricePerDay
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const listing = await prisma.listing.create({
      data: {
        hostId: session.userId,
        title,
        description,
        address,
        city,
        state,
        zipCode,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        pricePerHour: parseFloat(pricePerHour),
        pricePerDay: parseFloat(pricePerDay),
        maxVehicleSize,
        photos: typeof photos === 'string' ? photos : JSON.stringify(photos || []),
        entryInstructions,
        amenities: amenities ? JSON.stringify(amenities) : null,
        instantBook: instantBook !== false,
        cancellationPolicy: cancellationPolicy || 'FLEXIBLE',
        houseRules: houseRules || null,
      },
    })

    return NextResponse.json({ listing })
  } catch (error) {
    console.error('Create listing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

