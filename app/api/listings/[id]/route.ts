import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        ratings: {
          include: {
            driver: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        blockedDates: true,
      },
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    const avgRating =
      listing.ratings.length > 0
        ? listing.ratings.reduce((sum, r) => sum + r.rating, 0) / listing.ratings.length
        : 0

    return NextResponse.json({
      ...listing,
      averageRating: avgRating,
      ratingCount: listing.ratings.length,
    })
  } catch (error) {
    console.error('Get listing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    // Sanitize text fields (only include if provided)
    const title = body.title != null ? sanitizeRequired(body.title, 120) : undefined
    const description = body.description != null ? sanitizeRequired(body.description, 2000) : undefined
    const address = body.address != null ? sanitizeRequired(body.address, 200) : undefined
    const city = body.city != null ? sanitizeRequired(body.city, 100) : undefined
    const state = body.state != null ? sanitizeRequired(body.state, 50) : undefined
    const zipCode = body.zipCode != null ? sanitizeRequired(body.zipCode, 20) : undefined
    const entryInstructions = body.entryInstructions !== undefined
      ? sanitizeStringMax(body.entryInstructions, 1000)
      : undefined
    const houseRules = body.houseRules !== undefined
      ? sanitizeStringMax(body.houseRules, 1000)
      : undefined

    // Validate prices if provided
    const pricePerHour = body.pricePerHour != null
      ? validateNumber(body.pricePerHour, 0.01, 9999)
      : undefined
    const pricePerDay = body.pricePerDay != null
      ? validateNumber(body.pricePerDay, 0.01, 99999)
      : undefined

    if (body.pricePerHour != null && pricePerHour == null) {
      return NextResponse.json({ error: 'pricePerHour must be a valid positive number' }, { status: 400 })
    }
    if (body.pricePerDay != null && pricePerDay == null) {
      return NextResponse.json({ error: 'pricePerDay must be a valid positive number' }, { status: 400 })
    }

    // Validate enums if provided
    const cancellationPolicy = body.cancellationPolicy != null
      ? validateEnum(body.cancellationPolicy, ALLOWED_CANCELLATION_POLICIES)
        ? (body.cancellationPolicy as string)
        : listing.cancellationPolicy
      : undefined

    const maxVehicleSize = body.maxVehicleSize !== undefined
      ? validateEnum(body.maxVehicleSize, ALLOWED_VEHICLE_SIZES)
        ? (body.maxVehicleSize as string) || null
        : listing.maxVehicleSize
      : undefined

    // Coordinates
    const rawLat = body.latitude != null ? Number(body.latitude) : listing.latitude
    const rawLng = body.longitude != null ? Number(body.longitude) : listing.longitude
    const resolvedAddress = address ?? listing.address
    const resolvedCity = city ?? listing.city
    const resolvedState = state ?? listing.state
    const resolvedZip = zipCode ?? listing.zipCode

    let latitude = isNaN(rawLat) ? listing.latitude : rawLat
    let longitude = isNaN(rawLng) ? listing.longitude : rawLng

    if (latitude === 0 && longitude === 0 && resolvedAddress && resolvedCity && resolvedState) {
      const geocoded = await geocodeAddress(resolvedAddress, resolvedCity, resolvedState, resolvedZip || '')
      if (geocoded) {
        latitude = geocoded.lat
        longitude = geocoded.lng
      }
    }

    // Photos
    let photos: string | undefined
    if (body.photos != null) {
      const photosArr = Array.isArray(body.photos)
        ? body.photos
        : typeof body.photos === 'string'
          ? (() => { try { return JSON.parse(body.photos as string) } catch { return [] } })()
          : []
      const validatedPhotos = photosArr
        .filter((p: unknown) => isValidUploadUrl(p))
        .slice(0, 20)
      photos = JSON.stringify(validatedPhotos)
    }

    // Amenities
    const amenities = body.amenities != null
      ? JSON.stringify(Array.isArray(body.amenities) ? body.amenities.slice(0, 20) : [])
      : undefined

    const data: Record<string, unknown> = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(zipCode !== undefined && { zipCode }),
      latitude,
      longitude,
      ...(pricePerHour !== undefined && { pricePerHour }),
      ...(pricePerDay !== undefined && { pricePerDay }),
      ...(maxVehicleSize !== undefined && { maxVehicleSize }),
      ...(photos !== undefined && { photos }),
      ...(entryInstructions !== undefined && { entryInstructions }),
      ...(amenities !== undefined && { amenities }),
      ...(body.instantBook !== undefined && { instantBook: body.instantBook !== false }),
      ...(cancellationPolicy !== undefined && { cancellationPolicy }),
      ...(houseRules !== undefined && { houseRules }),
      ...(body.isActive !== undefined && { isActive: !!body.isActive }),
    }

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: data as Parameters<typeof prisma.listing.update>[0]['data'],
    })

    return NextResponse.json({ listing: updatedListing })
  } catch (error) {
    console.error('Update listing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
