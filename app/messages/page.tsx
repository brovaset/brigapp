'use client'

import dynamic from 'next/dynamic'

const MessagesPageClient = dynamic(
  () => import('@/components/MessagesPageClient'),
  {
    ssr: true,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-car-neon border-t-transparent" />
      </div>
    ),
  }
)

export default function MessagesPage() {
  return <MessagesPageClient />
}
