'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { motion } from 'framer-motion'
import FloatingCard from '@/components/FloatingCard'
import Link from 'next/link'

export default function HostResourcesPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const resources = [
    {
      title: 'Getting Started Guide',
      description: 'Learn how to create your first listing and start earning',
      link: '/host/listings/new'
    },
    {
      title: 'Pricing Strategies',
      description: 'Tips on how to set competitive prices for your parking space',
      content: [
        'Research nearby parking rates',
        'Consider location and demand',
        'Adjust prices for peak times',
        'Offer discounts for longer stays'
      ]
    },
    {
      title: 'Photography Tips',
      description: 'How to take great photos that attract more bookings',
      content: [
        'Use natural lighting',
        'Show the full parking space',
        'Include nearby landmarks',
        'Highlight unique features'
      ]
    },
    {
      title: 'Managing Bookings',
      description: 'Best practices for handling bookings and communicating with drivers',
      content: [
        'Respond to requests quickly',
        'Provide clear entry instructions',
        'Block unavailable dates',
        'Maintain good communication'
      ]
    },
    {
      title: 'Maximizing Earnings',
      description: 'Strategies to increase your revenue from parking rentals',
      content: [
        'Keep your calendar updated',
        'Offer competitive pricing',
        'Maintain high ratings',
        'Consider dynamic pricing'
      ]
    },
    {
      title: 'Legal & Safety',
      description: 'Important information about liability and safety requirements',
      content: [
        'Understand local regulations',
        'Maintain proper insurance',
        'Ensure space safety',
        'Follow platform guidelines'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Host Resources</h1>
          <p className="text-gray-600 text-lg">
            Everything you need to succeed as a BRIGAP host
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource, index) => (
            <FloatingCard key={index} delay={index * 0.1}>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{resource.title}</h2>
              <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
              
              {resource.link ? (
                <Link
                  href={resource.link}
                  className="inline-block px-4 py-2 bg-gradient-to-r from-car-neon to-car-electric text-white rounded-lg hover:from-car-neon/90 hover:to-car-electric/90 transition-all text-sm font-semibold"
                >
                  Get Started →
                </Link>
              ) : (
                <ul className="space-y-2">
                  {resource.content?.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-car-electric mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </FloatingCard>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 grid md:grid-cols-2 gap-6"
        >
          <FloatingCard delay={0.6}>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              Our support team is here to help you succeed as a host.
            </p>
            <Link
              href="/help"
              className="inline-block px-6 py-3 bg-gradient-to-r from-car-neon to-car-electric text-white rounded-lg hover:from-car-neon/90 hover:to-car-electric/90 transition-all font-semibold shadow-md"
            >
              Visit Help Center
            </Link>
          </FloatingCard>

          <FloatingCard delay={0.7}>
            <h3 className="text-xl font-bold text-gray-900 mb-3">View Your Earnings</h3>
            <p className="text-gray-600 mb-4">
              Track your revenue and see how much you're earning.
            </p>
            <Link
              href="/host/earnings"
              className="inline-block px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
            >
              Go to Earnings →
            </Link>
          </FloatingCard>
        </motion.div>
      </div>
    </div>
  )
}

