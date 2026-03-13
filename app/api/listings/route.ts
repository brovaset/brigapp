import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { calculateDistance } from '@/lib/utils'
import { geocodeAddress } from '@/lib/geocode'
import {
  sanitizeRequired,
  sanitizeStringMax,
  validateEnum,
  validateNumber,
  ALLOWED_CANCELLATION_POLICIES,
  ALLOWED_VEHICLE_SIZES,
  isValidUploadUrl,
} from '@/lib/validation'

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
    const radius = searchParams.get('radius') || '10'
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

    listings = listings.slice(0, limitParam)

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

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    // Sanitize text fields
    const title = sanitizeRequired(body.title, 120)
    const description = sanitizeRequired(body.description, 2000)
    const address = sanitizeRequired(body.address, 200)
    const city = sanitizeRequired(body.city, 100)
    const state = sanitizeRequired(body.state, 50)
    const zipCode = sanitizeRequired(body.zipCode, 20)

    if (!title || !description || !address || !city || !state || !zipCode) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields (title, description, address, city, state, zipCode)' },
        { status: 400 }
      )
    }

    // Validate prices — must be positive, max $9999
    const pricePerHour = validateNumber(body.pricePerHour, 0.01, 9999)
    const pricePerDay = validateNumber(body.pricePerDay, 0.01, 99999)

    if (pricePerHour == null || pricePerDay == null) {
      return NextResponse.json(
        { error: 'Prices must be valid positive numbers' },
        { status: 400 }
      )
    }

    // Validate enums
    const cancellationPolicy = validateEnum(body.cancellationPolicy, ALLOWED_CANCELLATION_POLICIES)
      ? (body.cancellationPolicy as string)
      : 'FLEXIBLE'

    const maxVehicleSize = validateEnum(body.maxVehicleSize, ALLOWED_VEHICLE_SIZES)
      ? (body.maxVehicleSize as string) || null
      : null

    // Optional text fields
    const entryInstructions = sanitizeStringMax(body.entryInstructions, 1000)
    const houseRules = sanitizeStringMax(body.houseRules, 1000)

    // Coordinates
    let lat = body.latitude != null && body.latitude !== '' ? parseFloat(String(body.latitude)) : 0
    let lng = body.longitude != null && body.longitude !== '' ? parseFloat(String(body.longitude)) : 0

    if ((isNaN(lat) || isNaN(lng)) || (lat === 0 && lng === 0)) {
      lat = 0
      lng = 0
    }

    if (lat === 0 && lng === 0 && address && city && state) {
      const geocoded = await geocodeAddress(address, city, state, zipCode || '')
      if (geocoded) {
        lat = geocoded.lat
        lng = geocoded.lng
      }
    }

    // Validate photos array
    let photosJson = '[]'
    if (body.photos) {
      const photosArr = Array.isArray(body.photos)
        ? body.photos
        : typeof body.photos === 'string'
          ? (() => { try { return JSON.parse(body.photos as string) } catch { return [] } })()
          : []
      const validatedPhotos = photosArr
        .filter((p: unknown) => isValidUploadUrl(p))
        .slice(0, 20)
      photosJson = typeof body.photos === 'string' && !Array.isArray(body.photos)
        ? JSON.stringify(validatedPhotos)
        : JSON.stringify(validatedPhotos)
    }

    // Amenities
    const amenitiesJson = body.amenities
      ? JSON.stringify(Array.isArray(body.amenities) ? body.amenities.slice(0, 20) : [])
      : null

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
        pricePerHour,
        pricePerDay,
        maxVehicleSize,
        photos: photosJson,
        entryInstructions,
        amenities: amenitiesJson,
        instantBook: body.instantBook !== false,
        cancellationPolicy,
        houseRules,
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
