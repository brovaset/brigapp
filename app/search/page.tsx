import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { getServerSession } from '@/lib/session'
import { getListingsServer } from '@/lib/listings-server'

const SearchPageClient = dynamic(
  () => import('@/components/SearchPageClient'),
  { ssr: true, loading: () => <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-car-neon border-t-transparent" /></div> }
)

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await getServerSession()
  if (!session) {
    redirect('/login')
  }

  const params = await searchParams
  const initialListings = await getListingsServer({
    lat: typeof params?.lat === 'string' ? params.lat : null,
    lng: typeof params?.lng === 'string' ? params.lng : null,
    radius: typeof params?.radius === 'string' ? params.radius : '10',
    startDate: typeof params?.startDate === 'string' ? params.startDate : null,
    endDate: typeof params?.endDate === 'string' ? params.endDate : null,
    location: typeof params?.location === 'string' ? params.location : null,
    limit: 100,
  })

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-car-neon border-t-transparent" /></div>}>
      <SearchPageClient initialListings={initialListings} />
    </Suspense>
  )
}
