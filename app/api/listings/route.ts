import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { calculateDistance } from '@/lib/utils'
import { geocodeAddress } from '@/lib/geocode'

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
    const limitParam = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '50', 10)), 100)
    const skipParam = Math.max(0, parseInt(searchParams.get('skip') || '0', 10))

    const includeBlockedDates = !!(startDate && endDate)
    const hasFilters = includeBlockedDates || !!(lat && lng)
    const take = hasFilters ? Math.min(limitParam * 5, 200) : limitParam

    let listings = await prisma.listing.findMany({
      where: { isActive: true },
      take,
      skip: hasFilters ? 0 : skipParam,
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

    // Filter by distance if coordinates provided (exclude 0,0 so ungeocoded listings don't appear in wrong place)
    if (lat && lng) {
      const userLat = parseFloat(lat)
      const userLng = parseFloat(lng)
      const radiusKm = parseFloat(radius)

      listings = listings.filter(listing => {
        if (listing.latitude === 0 && listing.longitude === 0) return false
        const distance = calculateDistance(userLat, userLng, listing.latitude, listing.longitude)
        return distance <= radiusKm
      })
    }

    // Apply limit after in-memory filters
    listings = listings.slice(0, limitParam)

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
      pricePerHour == null ||
      pricePerDay == null
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let lat = latitude != null && latitude !== '' ? parseFloat(latitude) : 0
    let lng = longitude != null && longitude !== '' ? parseFloat(longitude) : 0

    if (lat === 0 && lng === 0 && address && city && state) {
      const geocoded = await geocodeAddress(address, city, state, zipCode || '')
      if (geocoded) {
        lat = geocoded.lat
        lng = geocoded.lng
      }
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
        latitude: lat,
        longitude: lng,
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

