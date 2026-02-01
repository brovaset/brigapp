'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { formatCurrency } from '@/lib/utils'
import AnimatedBackground from '@/components/AnimatedBackground'
import FloatingCard from '@/components/FloatingCard'
import NeonButton from '@/components/NeonButton'
import { motion } from 'framer-motion'

export default function EarningsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [earnings, setEarnings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchEarnings()
  }, [user, router])

  const fetchEarnings = async () => {
    try {
      const res = await fetch('/api/host/earnings')
      const data = await res.json()
      if (res.ok) {
        setEarnings(data)
      }
    } catch (error) {
      console.error('Error fetching earnings:', error)
    } finally {
      setLoading(false)
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
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-6 text-neon-cyan hover:text-neon-pink transition-colors"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-4xl font-bold mb-8 gradient-text">Payout Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <FloatingCard glowColor="cyan" delay={0}>
            <p className="text-sm text-gray-400 mb-2">Total Earnings</p>
            <p className="text-3xl font-bold text-neon-cyan">
              {formatCurrency(earnings.totalEarnings)}
            </p>
          </FloatingCard>
          <FloatingCard glowColor="pink" delay={0.1}>
            <p className="text-sm text-gray-400 mb-2">This Month</p>
            <p className="text-3xl font-bold text-neon-pink">
              {formatCurrency(earnings.thisMonthEarnings)}
            </p>
          </FloatingCard>
          <FloatingCard glowColor="purple" delay={0.2}>
            <p className="text-sm text-gray-400 mb-2">Total Bookings</p>
            <p className="text-3xl font-bold text-neon-purple">
              {earnings.totalBookings}
            </p>
          </FloatingCard>
        </div>

        {/* Transactions */}
        <FloatingCard glowColor="purple">
          <h2 className="text-2xl font-bold mb-6 text-white">Transaction History</h2>
          
          {earnings.transactions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No completed transactions yet
            </p>
          ) : (
            <div className="space-y-4">
              {earnings.transactions.map((transaction: any) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-white mb-1">
                        {transaction.listing.title}
                      </p>
                      <p className="text-sm text-gray-400 mb-1">
                        {transaction.listing.address}
                      </p>
                      <p className="text-sm text-gray-400">
                        Driver: {transaction.driver.firstName} {transaction.driver.lastName}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(transaction.date).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-neon-cyan mb-1">
                        {formatCurrency(transaction.amount)}
                      </p>
                      <span className={`px-2 py-1 rounded text-xs ${
                        transaction.paymentStatus === 'COMPLETED'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
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

