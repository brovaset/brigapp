import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { geocodeAddress } from '@/lib/geocode'

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

    const body = await request.json()
    const lat = body.latitude != null ? Number(body.latitude) : listing.latitude
    const lng = body.longitude != null ? Number(body.longitude) : listing.longitude
    const address = body.address ?? listing.address
    const city = body.city ?? listing.city
    const state = body.state ?? listing.state
    const zipCode = body.zipCode ?? listing.zipCode

    let latitude = lat
    let longitude = lng
    if (lat === 0 && lng === 0 && address && city && state) {
      const geocoded = await geocodeAddress(address, city, state, zipCode || '')
      if (geocoded) {
        latitude = geocoded.lat
        longitude = geocoded.lng
      }
    }

    const photos = body.photos != null
      ? (typeof body.photos === 'string' ? body.photos : JSON.stringify(Array.isArray(body.photos) ? body.photos : []))
      : undefined
    const amenities = body.amenities != null
      ? (typeof body.amenities === 'string' ? body.amenities : JSON.stringify(body.amenities))
      : undefined

    const data: Record<string, unknown> = {
      ...(body.title != null && { title: body.title }),
      ...(body.description != null && { description: body.description }),
      ...(body.address != null && { address: body.address }),
      ...(body.city != null && { city: body.city }),
      ...(body.state != null && { state: body.state }),
      ...(body.zipCode != null && { zipCode: body.zipCode }),
      latitude,
      longitude,
      ...(body.pricePerHour != null && { pricePerHour: parseFloat(body.pricePerHour) }),
      ...(body.pricePerDay != null && { pricePerDay: parseFloat(body.pricePerDay) }),
      ...(body.maxVehicleSize !== undefined && { maxVehicleSize: body.maxVehicleSize || null }),
      ...(photos !== undefined && { photos }),
      ...(body.entryInstructions !== undefined && { entryInstructions: body.entryInstructions || null }),
      ...(amenities !== undefined && { amenities }),
      ...(body.instantBook !== undefined && { instantBook: body.instantBook !== false }),
      ...(body.cancellationPolicy != null && { cancellationPolicy: body.cancellationPolicy || 'FLEXIBLE' }),
      ...(body.houseRules !== undefined && { houseRules: body.houseRules || null }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
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

