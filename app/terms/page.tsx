'use client'

import { motion } from 'framer-motion'
import FloatingCard from '@/components/FloatingCard'

export default function TermsPage() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing and using BRIGAP, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.'
    },
    {
      title: '2. Description of Service',
      content: 'BRIGAP is a platform that connects drivers seeking parking spaces with hosts who have available parking spaces to rent. We facilitate transactions but are not a party to the rental agreement between drivers and hosts.'
    },
    {
      title: '3. User Accounts',
      content: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.'
    },
    {
      title: '4. Booking and Payment',
      content: 'All bookings are subject to availability and host approval. Payment is processed through our secure payment system. Refunds are subject to our cancellation policy and the host\'s specific cancellation terms.'
    },
    {
      title: '5. Host Responsibilities',
      content: 'Hosts are responsible for providing accurate listing information, maintaining their parking spaces in safe and accessible condition, and honoring confirmed bookings. Hosts must comply with all local laws and regulations.'
    },
    {
      title: '6. Driver Responsibilities',
      content: 'Drivers are responsible for following entry instructions, respecting the parking space and surrounding property, and ensuring their vehicle is properly insured. Drivers must comply with all booking terms and local regulations.'
    },
    {
      title: '7. Fees and Charges',
      content: 'BRIGAP charges a service fee on all transactions. This fee is clearly displayed before booking confirmation. Hosts receive payment minus our service fee and any applicable payment processing fees.'
    },
    {
      title: '8. Cancellation and Refunds',
      content: 'Cancellation policies vary by listing and are displayed on each listing page. Refunds are processed according to the applicable cancellation policy. BRIGAP reserves the right to cancel bookings in cases of fraud or policy violations.'
    },
    {
      title: '9. Prohibited Activities',
      content: 'Users may not use BRIGAP for illegal activities, fraud, harassment, or to violate any laws. Prohibited activities include but are not limited to: providing false information, circumventing fees, or using the platform to harm others.'
    },
    {
      title: '10. Limitation of Liability',
      content: 'BRIGAP acts as an intermediary platform. We are not responsible for the condition of parking spaces, vehicle damage, or disputes between users. Users use the platform at their own risk.'
    },
    {
      title: '11. Intellectual Property',
      content: 'All content on BRIGAP, including logos, text, graphics, and software, is the property of BRIGAP or its licensors and is protected by copyright and other intellectual property laws.'
    },
    {
      title: '12. Modifications to Terms',
      content: 'BRIGAP reserves the right to modify these terms at any time. Users will be notified of significant changes. Continued use of the platform after changes constitutes acceptance of the new terms.'
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
          <p className="text-gray-600">
            Last updated: March 2024
          </p>
        </motion.div>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <FloatingCard key={index} delay={index * 0.05}>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
              <p className="text-gray-600 leading-relaxed">{section.content}</p>
            </FloatingCard>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-2">Questions About Our Terms?</h3>
          <p className="text-gray-600 mb-4">
            If you have any questions about these terms and conditions, please contact us.
          </p>
          <a
            href="mailto:legal@brigap.com"
            className="inline-block px-6 py-3 bg-gradient-to-r from-car-neon to-car-electric text-white rounded-lg hover:from-car-neon/90 hover:to-car-electric/90 transition-all font-semibold shadow-md"
          >
            Contact Legal Team
          </a>
        </motion.div>
      </div>
    </div>
  )
}

