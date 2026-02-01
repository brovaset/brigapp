'use client'

import { motion } from 'framer-motion'
import FloatingCard from '@/components/FloatingCard'

export default function PressPage() {
  const pressReleases = [
    {
      title: 'BRIGAP Launches in Major Cities',
      date: 'March 15, 2024',
      excerpt: 'BRIGAP announces expansion to 10 major metropolitan areas, bringing accessible parking solutions to urban centers nationwide.'
    },
    {
      title: 'Partnership with City Governments',
      date: 'February 8, 2024',
      excerpt: 'BRIGAP partners with city governments to optimize parking utilization and reduce urban congestion.'
    },
    {
      title: 'Series A Funding Round',
      date: 'January 20, 2024',
      excerpt: 'BRIGAP secures $10M in Series A funding to accelerate growth and expand platform capabilities.'
    }
  ]

  const mediaKit = {
    logo: 'Download our logo in various formats',
    photos: 'Access high-resolution photos of our platform',
    brandGuidelines: 'Review our brand guidelines and usage policies',
    factSheet: 'Download our company fact sheet'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Press & Media</h1>
          <p className="text-gray-600 text-lg">
            Latest news, press releases, and media resources
          </p>
        </motion.div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Press Releases</h2>
          <div className="space-y-4">
            {pressReleases.map((release, index) => (
              <FloatingCard key={index} delay={index * 0.1}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{release.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{release.date}</p>
                    <p className="text-gray-600">{release.excerpt}</p>
                  </div>
                </div>
              </FloatingCard>
            ))}
          </div>
        </div>

        <FloatingCard delay={0.3}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Media Kit</h2>
          <p className="text-gray-600 mb-6">
            Download resources for media coverage and press materials.
          </p>
          <div className="space-y-3">
            {Object.entries(mediaKit).map(([key, value], index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{value}</span>
                <a
                  href={`mailto:press@brigap.com?subject=Media Kit Request: ${key}`}
                  className="text-car-neon hover:text-car-electric font-semibold text-sm"
                >
                  Request →
                </a>
              </div>
            ))}
          </div>
        </FloatingCard>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-2">Media Inquiries</h3>
          <p className="text-gray-600 mb-4">
            For press inquiries, interview requests, or media partnerships, please contact our press team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:press@brigap.com"
              className="px-6 py-3 bg-gradient-to-r from-car-neon to-car-electric text-white rounded-lg hover:from-car-neon/90 hover:to-car-electric/90 transition-all font-semibold shadow-md text-center"
            >
              Email Press Team
            </a>
            <a
              href="tel:+1-555-PRESS"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold text-center"
            >
              Call Press Line
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

