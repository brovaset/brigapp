'use client'

import { motion } from 'framer-motion'
import FloatingCard from '@/components/FloatingCard'

export default function SafetyPage() {
  const safetyFeatures = [
    {
      title: 'Verified Users',
      description: 'All users must verify their identity before using our platform. We verify email addresses and phone numbers to ensure account authenticity.',
    },
    {
      title: 'Secure Payments',
      description: 'All transactions are processed through Stripe, a PCI-compliant payment processor. Your payment information is encrypted and never stored on our servers.',
    },
    {
      title: '24/7 Support',
      description: 'Our support team is available around the clock to help with any issues, disputes, or emergencies that may arise during your parking experience.',
    },
    {
      title: 'Rating System',
      description: 'Both drivers and hosts can rate each other after bookings, helping maintain a safe and trustworthy community.',
    },
    {
      title: 'Photo Verification',
      description: 'We encourage users to take photos before and after parking to document the condition of vehicles and spaces.',
    },
    {
      title: 'Dispute Resolution',
      description: 'Our team reviews and resolves disputes fairly and promptly. We investigate all reported issues and take appropriate action.',
    }
  ]

  const safetyTips = [
    {
      category: 'For Drivers',
      tips: [
        'Always verify the parking space location before arriving',
        'Take photos of your vehicle before and after parking',
        'Follow the host\'s entry instructions carefully',
        'Respect the parking space and surrounding property',
        'Contact support immediately if you encounter any issues',
        'Read reviews and ratings before booking'
      ]
    },
    {
      category: 'For Hosts',
      tips: [
        'Provide clear and accurate entry instructions',
        'Keep your parking space clean and accessible',
        'Respond promptly to booking requests and messages',
        'Block dates when your space is unavailable',
        'Maintain clear communication with drivers',
        'Report any issues or concerns immediately'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Safety & Security</h1>
          <p className="text-gray-600 text-lg">
            Your safety is our top priority. Learn about our safety features and best practices.
          </p>
        </motion.div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Safety Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {safetyFeatures.map((feature, index) => (
              <FloatingCard key={index} delay={index * 0.1}>
                <div className="flex items-start gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              </FloatingCard>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {safetyTips.map((section, index) => (
            <FloatingCard key={index} delay={index * 0.1}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.category}</h2>
              <ul className="space-y-3">
                {section.tips.map((tip, tipIndex) => (
                  <motion.li
                    key={tipIndex}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + tipIndex * 0.05 }}
                    className="flex items-start gap-3 text-gray-700"
                  >
                    <span className="text-car-electric mt-1">•</span>
                    <span>{tip}</span>
                  </motion.li>
                ))}
              </ul>
            </FloatingCard>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-2">Report a Safety Issue</h3>
          <p className="text-gray-600 mb-4">
            If you encounter any safety concerns, please report them immediately.
          </p>
          <div className="flex gap-4">
            <a
              href="mailto:safety@brigap.com"
              className="px-6 py-3 bg-gradient-to-r from-car-neon to-car-electric text-white rounded-lg hover:from-car-neon/90 hover:to-car-electric/90 transition-all font-semibold shadow-md"
            >
              Email Safety Team
            </a>
            <a
              href="tel:+1-800-BRIGAP"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
            >
              Call Support
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

