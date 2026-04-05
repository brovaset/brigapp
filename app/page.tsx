'use client'

import { Fragment, Suspense, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/AuthProvider'
import SearchBar from '@/components/SearchBar'
import { parseResponseJson } from '@/lib/utils'
import type { Listing } from '@/types'

const HomeFeaturedListings = dynamic(
  () => import('@/components/HomeFeaturedListings'),
  { ssr: true, loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded-xl" /> }
)

const HomeFeaturesSection = dynamic(
  () => import('@/components/HomeFeaturesSection'),
  { ssr: true, loading: () => <div className="h-80 bg-gray-50" /> }
)

const STATS = [
  { value: '5,000+', label: 'Spaces listed' },
  { value: '4.8',    label: 'Average rating', suffix: '★' },
  { value: '< 60s',  label: 'To book a spot' },
]

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [loadingListings, setLoadingListings] = useState(true)

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  useEffect(() => {
    fetch('/api/listings?limit=12')
      .then((r) => parseResponseJson<{ listings?: Listing[] }>(r))
      .then((d) => { if (d?.listings) setListings(d.listings.slice(0, 12)) })
      .catch(() => {})
      .finally(() => setLoadingListings(false))
  }, [])

  if (!loading && user) return null

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 bg-white">

        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Orange ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-orange-500/[0.06] rounded-full blur-3xl pointer-events-none" />

        {/* Fade out the pattern at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            {/* Eyebrow label */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-xs font-medium text-orange-600 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              Parking, simplified
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-bold text-gray-900 tracking-tight leading-[1.08] mb-5">
              Park smarter,{' '}
              <span className="text-car-neon">stress&nbsp;less</span>
            </h1>

            <p className="text-lg text-gray-500 max-w-lg mx-auto mb-10 leading-relaxed">
              Find driveways, garages, and private spots near you — book in seconds.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="max-w-3xl mx-auto mb-10"
          >
            <Suspense fallback={<div className="h-16 max-w-3xl mx-auto rounded-2xl bg-gray-100 animate-pulse" />}>
              <SearchBar />
            </Suspense>
          </motion.div>

          {/* Trust stats — pill container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-sm shadow-sm divide-x divide-gray-200">
              {STATS.map((s) => (
                <div key={s.label} className="px-7 py-3.5 text-center">
                  <div className="text-[15px] font-bold text-gray-900 leading-none">
                    {s.value}
                    {s.suffix && <span className="text-car-neon ml-0.5">{s.suffix}</span>}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Featured listings ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <HomeFeaturedListings listings={listings} loading={loadingListings} />
      </section>

      {/* ── Features + CTA ── */}
      <HomeFeaturesSection />

      {/* ── Footer CTA ── */}
      <div className="border-t border-gray-100 py-10 text-center bg-gray-50">
        <p className="text-sm text-gray-500 mb-4">Have a driveway or garage you&apos;re not using?</p>
        <Link
          href="/register?role=host"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          List your space →
        </Link>
      </div>

    </div>
  )
}
