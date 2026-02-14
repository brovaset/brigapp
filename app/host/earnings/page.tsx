'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { formatCurrency, parseResponseJson } from '@/lib/utils'
import FloatingCard from '@/components/FloatingCard'
import NeonButton from '@/components/NeonButton'
import { motion } from 'framer-motion'

function EarningsContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [earnings, setEarnings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [cashingOut, setCashingOut] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    setMessage('')
    const success = searchParams.get('success')
    const refresh = searchParams.get('refresh')
    if (success === 'true') {
      setMessage('Bank account connected successfully!')
      window.history.replaceState({}, '', '/host/earnings')
    } else if (refresh === 'true') {
      setMessage('Please complete the setup to connect your bank account.')
      window.history.replaceState({}, '', '/host/earnings')
    }
    fetchEarnings()
  }, [user, router, searchParams])

  const fetchEarnings = async () => {
    try {
      const res = await fetch('/api/host/earnings')
      const data = await parseResponseJson(res)
      if (res.ok) {
        setEarnings(data)
      }
    } catch (error) {
      console.error('Error fetching earnings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnectStripe = async () => {
    setConnecting(true)
    setMessage('')
    try {
      const res = await fetch('/api/host/connect/account-link', { method: 'POST' })
      const data = await parseResponseJson<{ url?: string; error?: string }>(res)
      if (res.ok && data.url) {
        window.location.href = data.url
        return
      }
      setMessage(data?.error || 'Failed to create connect link')
    } catch (error) {
      setMessage('Failed to connect')
    } finally {
      setConnecting(false)
    }
  }

  const handleCashOut = async () => {
    if (!earnings?.availableBalance || earnings.availableBalance < 1) return
    setCashingOut(true)
    setMessage('')
    try {
      const res = await fetch('/api/host/payouts', { method: 'POST' })
      const data = await parseResponseJson<{ success?: boolean; amount?: number; error?: string }>(res)
      if (res.ok && data.success) {
        setMessage(`Successfully cashed out ${formatCurrency(data.amount ?? 0)}! Funds will appear in your bank within 2–3 business days.`)
        fetchEarnings()
      } else {
        setMessage(data?.error || 'Cash out failed')
      }
    } catch (error) {
      setMessage('Cash out failed')
    } finally {
      setCashingOut(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-car-neon border-t-transparent"></div>
          <p className="text-gray-600 text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!earnings) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-6 text-car-neon hover:text-car-electric transition-colors font-medium"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-4xl font-bold mb-8 text-gray-900">Payout Dashboard</h1>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-car-electric/10 border border-car-electric/30 text-car-electric"
          >
            {message}
          </motion.div>
        )}

        {/* Connect Stripe if not connected */}
        {!earnings.stripeConnected && (
          <FloatingCard glowColor="electric" className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Connect your bank account</h2>
                <p className="text-gray-600">
                  Connect your bank account with Stripe to receive payouts from your driveway rentals.
                </p>
              </div>
              <NeonButton
                variant="primary"
                onClick={handleConnectStripe}
                disabled={connecting}
              >
                {connecting ? 'Connecting...' : 'Connect Bank Account'}
              </NeonButton>
            </div>
          </FloatingCard>
        )}

        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <FloatingCard glowColor="neon" delay={0}>
            <p className="text-sm text-gray-500 mb-2">Total Earnings</p>
            <p className="text-3xl font-bold text-car-neon">
              {formatCurrency(earnings.totalEarnings)}
            </p>
          </FloatingCard>
          <FloatingCard glowColor="electric" delay={0.1}>
            <p className="text-sm text-gray-500 mb-2">Available to Cash Out</p>
            <p className="text-3xl font-bold text-car-electric">
              {formatCurrency(earnings.availableBalance ?? 0)}
            </p>
          </FloatingCard>
          <FloatingCard glowColor="turbo" delay={0.2}>
            <p className="text-sm text-gray-500 mb-2">This Month</p>
            <p className="text-3xl font-bold text-car-turbo">
              {formatCurrency(earnings.thisMonthEarnings)}
            </p>
          </FloatingCard>
          <FloatingCard glowColor="neutral" delay={0.3}>
            <p className="text-sm text-gray-500 mb-2">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-900">
              {earnings.totalBookings}
            </p>
          </FloatingCard>
        </div>

        {/* Cash Out */}
        {earnings.stripeConnected && (earnings.availableBalance ?? 0) >= 1 && (
          <FloatingCard glowColor="electric" className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-gray-600 mb-1">Cash out your available earnings</p>
                <p className="text-2xl font-bold text-car-electric">
                  {formatCurrency(earnings.availableBalance)}
                </p>
              </div>
              <NeonButton
                variant="primary"
                onClick={handleCashOut}
                disabled={cashingOut || (earnings.availableBalance ?? 0) < 1}
              >
                {cashingOut ? 'Processing...' : 'Cash Out'}
              </NeonButton>
            </div>
          </FloatingCard>
        )}

        {/* Payout History */}
        {earnings.stripeConnected && earnings.payouts?.length > 0 && (
          <FloatingCard glowColor="neutral" className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Payout History</h2>
            <div className="space-y-3">
              {earnings.payouts.map((p: { id: string; amount: number; status: string; createdAt: string }) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <span className="text-sm text-gray-500">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                  <span className="font-semibold text-gray-900">{formatCurrency(p.amount)}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    p.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </FloatingCard>
        )}

        {/* Transactions */}
        <FloatingCard glowColor="neutral">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Transaction History</h2>

          {earnings.transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No completed transactions yet
            </p>
          ) : (
            <div className="space-y-4">
              {earnings.transactions.map((transaction: any) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">
                        {transaction.listing.title}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        {transaction.listing.address}
                      </p>
                      <p className="text-sm text-gray-600">
                        Driver: {transaction.driver.firstName} {transaction.driver.lastName}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(transaction.date).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-car-electric mb-1">
                        {formatCurrency(transaction.amount)}
                      </p>
                      <span className={`px-2 py-1 rounded text-xs ${
                        transaction.paymentStatus === 'COMPLETED'
                          ? 'bg-car-electric/20 text-car-electric'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {transaction.paymentStatus}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </FloatingCard>
      </div>
    </div>
  )
}

export default function EarningsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-car-neon border-t-transparent" />
        </div>
      }
    >
      <EarningsContent />
    </Suspense>
  )
}
