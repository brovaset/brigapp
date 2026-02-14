import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ListingDetailClient, {
  type ListingDetailListing,
} from '@/components/ListingDetailClient'

function parsePhotos(photos: string | string[] | undefined): string[] {
  if (!photos) return []
  if (Array.isArray(photos)) return photos
  try {
    const parsed = JSON.parse(photos)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const row = await prisma.listing.findUnique({
    where: { id },
    include: {
      host: {
        select: { id: true, firstName: true, lastName: true },
      },
      ratings: {
        include: {
          driver: {
            select: { firstName: true, lastName: true },
          },
        },
      },
    },
  })

  if (!row) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Listing not found
          </h1>
          <Link href="/search" className="text-car-neon hover:underline">
            Browse listings
          </Link>
        </div>
      </div>
    )
  }

  const avgRating =
    row.ratings.length > 0
      ? row.ratings.reduce((sum, r) => sum + r.rating, 0) / row.ratings.length
      : 0

  const listing: ListingDetailListing = {
    id: row.id,
    title: row.title,
    address: row.address,
    description: row.description,
    pricePerHour: row.pricePerHour,
    pricePerDay: row.pricePerDay,
    maxVehicleSize: row.maxVehicleSize,
    instantBook: row.instantBook,
    cancellationPolicy: row.cancellationPolicy,
    amenities: row.amenities,
    averageRating: avgRating,
    ratingCount: row.ratings.length,
    photos: parsePhotos(row.photos),
    hostId: row.hostId,
    host: row.host,
    ratings: row.ratings,
  }

  return <ListingDetailClient listing={listing} />
}
