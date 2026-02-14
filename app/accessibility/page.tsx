'use client'

import { motion } from 'framer-motion'
import FloatingCard from '@/components/FloatingCard'

export default function AccessibilityPage() {
  const commitments = [
    {
      title: 'Web Accessibility',
      description: 'Our website is designed to be accessible to all users, including those with disabilities. We follow WCAG 2.1 Level AA guidelines.',
      features: [
        'Keyboard navigation support',
        'Screen reader compatibility',
        'High contrast mode',
        'Text size adjustments',
        'Alt text for all images'
      ]
    },
    {
      title: 'Physical Accessibility',
      description: 'We work with hosts to provide accessible parking options for users with mobility needs.',
      features: [
        'Accessible parking space filters',
        'Wheelchair-accessible locations',
        'Clear accessibility information in listings',
        'Host accessibility guidelines'
      ]
    },
    {
      title: 'Communication',
      description: 'We provide multiple ways to communicate and access information.',
      features: [
        'Multiple contact methods',
        'Clear, simple language',
        'Visual and text-based information',
        'Support for assistive technologies'
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Accessibility</h1>
          <p className="text-gray-600 text-lg">
            BRIGAP is committed to making our platform accessible to everyone, regardless of ability.
          </p>
        </motion.div>

        <div className="space-y-6 mb-8">
          {commitments.map((commitment, index) => (
            <FloatingCard key={index} delay={index * 0.1}>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{commitment.title}</h2>
              <p className="text-gray-600 mb-4">{commitment.description}</p>
              <ul className="space-y-2">
                {commitment.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3 text-gray-700">
                    <svg className="w-4 h-4 text-car-electric mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </FloatingCard>
          ))}
        </div>

        <FloatingCard delay={0.3}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accessibility Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Keyboard Navigation</h3>
              <p className="text-gray-600 text-sm mb-4">
                Navigate our entire website using only your keyboard. Use Tab to move between elements, Enter to activate buttons, and Escape to close modals.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Screen Readers</h3>
              <p className="text-gray-600 text-sm mb-4">
                Our site is compatible with screen readers like JAWS, NVDA, and VoiceOver. All interactive elements have proper labels and descriptions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Color Contrast</h3>
              <p className="text-gray-600 text-sm mb-4">
                We maintain high contrast ratios between text and backgrounds to ensure readability for users with visual impairments.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Text Scaling</h3>
              <p className="text-gray-600 text-sm mb-4">
                All text can be scaled up to 200% without losing functionality. Use your browser&apos;s zoom feature or text size settings.
              </p>
            </div>
          </div>
        </FloatingCard>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-2">Report Accessibility Issues</h3>
          <p className="text-gray-600 mb-4">
            If you encounter any accessibility barriers, please let us know so we can improve.
          </p>
          <a
            href="mailto:accessibility@brigap.com"
            className="inline-block px-6 py-3 bg-gradient-to-r from-car-neon to-car-electric text-white rounded-lg hover:from-car-neon/90 hover:to-car-electric/90 transition-all font-semibold shadow-md"
          >
            Contact Accessibility Team
          </a>
        </motion.div>
      </div>
    </div>
  )
}

