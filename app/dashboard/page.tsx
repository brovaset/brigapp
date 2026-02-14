import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getServerSession } from '@/lib/session'
import { getBookingsServer } from '@/lib/bookings-server'

const DashboardClient = dynamic(
  () => import('@/components/DashboardClient'),
  { ssr: true, loading: () => <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-car-neon border-t-transparent" /></div> }
)

export default async function DashboardPage() {
  const session = await getServerSession()
  if (!session) {
    redirect('/login')
  }

  const initialBookings = await getBookingsServer(session)

  return (
    <DashboardClient
      session={session}
      initialBookings={initialBookings}
    />
  )
}
