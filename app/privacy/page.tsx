'use client'

import { motion } from 'framer-motion'
import FloatingCard from '@/components/FloatingCard'

export default function PrivacyPage() {
  const sections = [
    {
      title: 'Information We Collect',
      content: [
        'Personal information (name, email, phone number) provided during registration',
        'Payment information processed securely through Stripe',
        'Location data when you search for or list parking spaces',
        'Usage data including how you interact with our platform',
        'Communication records including messages between users'
      ]
    },
    {
      title: 'How We Use Your Information',
      content: [
        'To provide and improve our services',
        'To process transactions and send booking confirmations',
        'To communicate with you about your account and bookings',
        'To send marketing communications (with your consent)',
        'To prevent fraud and ensure platform security',
        'To comply with legal obligations'
      ]
    },
    {
      title: 'Information Sharing',
      content: [
        'We share booking information between drivers and hosts to facilitate transactions',
        'We use third-party service providers (payment processors, hosting) who are bound by confidentiality agreements',
        'We may share information if required by law or to protect our rights',
        'We do not sell your personal information to third parties'
      ]
    },
    {
      title: 'Data Security',
      content: [
        'We use industry-standard encryption to protect your data',
        'Payment information is processed securely through Stripe and never stored on our servers',
        'We implement access controls and security measures to protect against unauthorized access',
        'Regular security audits and updates to maintain protection'
      ]
    },
    {
      title: 'Your Rights',
      content: [
        'Access your personal data',
        'Correct inaccurate information',
        'Request deletion of your account and data',
        'Opt-out of marketing communications',
        'Export your data in a portable format',
        'Object to certain processing activities'
      ]
    },
    {
      title: 'Cookies and Tracking',
      content: [
        'We use cookies to enhance your experience and analyze platform usage',
        'Essential cookies are required for the platform to function',
        'Analytics cookies help us improve our services',
        'You can manage cookie preferences in your browser settings'
      ]
    },
    {
      title: 'Children\'s Privacy',
      content: 'BRIGAP is not intended for users under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child, we will delete it immediately.'
    },
    {
      title: 'Changes to This Policy',
      content: 'We may update this privacy policy from time to time. We will notify you of significant changes via email or through our platform. Your continued use after changes constitutes acceptance of the updated policy.'
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">
            Last updated: March 2024
          </p>
        </motion.div>

        <FloatingCard delay={0.1}>
          <p className="text-gray-600 mb-4">
            At BRIGAP, we are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information when you use our platform.
          </p>
        </FloatingCard>

        <div className="space-y-6 mt-6">
          {sections.map((section, index) => (
            <FloatingCard key={index} delay={0.2 + index * 0.05}>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
              {Array.isArray(section.content) ? (
                <ul className="space-y-2">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3 text-gray-600">
                      <span className="text-car-electric mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 leading-relaxed">{section.content}</p>
              )}
            </FloatingCard>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-2">Contact Us About Privacy</h3>
          <p className="text-gray-600 mb-4">
            If you have questions about this privacy policy or wish to exercise your rights, please contact us.
          </p>
          <a
            href="mailto:privacy@brigap.com"
            className="inline-block px-6 py-3 bg-gradient-to-r from-car-neon to-car-electric text-white rounded-lg hover:from-car-neon/90 hover:to-car-electric/90 transition-all font-semibold shadow-md"
          >
            Contact Privacy Team
          </a>
        </motion.div>
      </div>
    </div>
  )
}

