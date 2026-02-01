'use client'

import { motion } from 'framer-motion'
import FloatingCard from '@/components/FloatingCard'

export default function AboutPage() {
  const values = [
    {
      title: 'Innovation',
      description: 'We use cutting-edge technology to make parking simple and efficient.',
    },
    {
      title: 'Community',
      description: 'We build connections between drivers and hosts, creating value for everyone.',
    },
    {
      title: 'Sustainability',
      description: 'By maximizing parking space utilization, we reduce urban congestion and environmental impact.',
    },
    {
      title: 'Accessibility',
      description: 'We make parking accessible and affordable for everyone, everywhere.',
    }
  ]

  const stats = [
    { number: '10,000+', label: 'Active Users' },
    { number: '5,000+', label: 'Parking Spaces' },
    { number: '50,000+', label: 'Successful Bookings' },
    { number: '4.8/5', label: 'Average Rating' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About BRIGAP</h1>
          <p className="text-xl text-gray-600">
            Revolutionizing urban parking, one space at a time
          </p>
        </motion.div>

        <FloatingCard delay={0.1}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-4">
            BRIGAP was founded with a simple mission: to make parking easier, more accessible, and more efficient for everyone. We believe that unused parking spaces represent untapped value, and by connecting drivers with available spaces, we create a win-win solution for communities.
          </p>
          <p className="text-gray-600">
            Whether you're a driver looking for convenient parking or a property owner wanting to monetize unused space, BRIGAP provides the platform and tools you need to succeed.
          </p>
        </FloatingCard>

        <div className="my-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {values.map((value, index) => (
              <FloatingCard key={index} delay={0.2 + index * 0.1}>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </FloatingCard>
            ))}
          </div>
        </div>

        <FloatingCard delay={0.6}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">By The Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-car-neon mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </FloatingCard>

        <FloatingCard delay={0.8}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Us</h2>
          <p className="text-gray-600 mb-6">
            Whether you're looking for parking or have space to share, BRIGAP makes it easy to get started. Join thousands of users who are already making parking simpler and more efficient.
          </p>
          <div className="flex gap-4">
            <a
              href="/register?role=driver"
              className="px-6 py-3 bg-gradient-to-r from-car-neon to-car-electric text-white rounded-lg hover:from-car-neon/90 hover:to-car-electric/90 transition-all font-semibold shadow-md"
            >
              Find Parking
            </a>
            <a
              href="/register?role=host"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
            >
              List Your Space
            </a>
          </div>
        </FloatingCard>
      </div>
    </div>
  )
}

