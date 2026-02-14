import { prisma } from '@/lib/prisma'
import { calculateDistance } from '@/lib/utils'
import { geocodeAddress } from '@/lib/geocode'

export interface ListingsSearchParams {
  lat?: string | null
  lng?: string | null
  radius?: string
  startDate?: string | null
  endDate?: string | null
  location?: string | null
  limit?: number
}

function parsePhotos(photos: string | undefined): string[] {
  if (!photos) return []
  try {
    const p = JSON.parse(photos)
    return Array.isArray(p) ? p : []
  } catch {
    return []
  }
}

export async function getListingsServer(params: ListingsSearchParams) {
  const limitParam = Math.min(Math.max(1, params.limit ?? 50), 100)
  const radius = params.radius || '10'
  const startDate = params.startDate
  const endDate = params.endDate

  let lat = params.lat
  let lng = params.lng

  if ((!lat || !lng) && params.location) {
    const parts = params.location.split(',').map((s) => s.trim())
    const geocoded = await geocodeAddress(
      parts[0] || params.location,
      parts[1] || '',
      parts[2] || '',
      parts[3] || ''
    )
    if (geocoded) {
      lat = String(geocoded.lat)
      lng = String(geocoded.lng)
    }
  }

  const includeBlockedDates = !!(startDate && endDate)
  const hasFilters = includeBlockedDates || !!(lat && lng)
  const take = hasFilters ? Math.min(limitParam * 5, 200) : limitParam

  let listings = await prisma.listing.findMany({
    where: { isActive: true },
    take,
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

    listings = listings.filter((listing: any) => {
      if (listing.latitude === 0 && listing.longitude === 0) return false
      const distance = calculateDistance(
        userLat,
        userLng,
        listing.latitude,
        listing.longitude
      )
      return distance <= radiusKm
    })
  }

  listings = listings.slice(0, limitParam)

  const listingsWithRatings = listings.map((listing: any) => {
    const avgRating =
      listing.ratings?.length > 0
        ? listing.ratings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) /
          listing.ratings.length
        : 0

    return {
      ...listing,
      photos: parsePhotos(listing.photos),
      averageRating: avgRating,
      ratingCount: listing.ratings?.length ?? 0,
      ratings: undefined,
    }
  })

  return listingsWithRatings
}
