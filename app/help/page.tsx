'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import FloatingCard from '@/components/FloatingCard'

export default function HelpPage() {
  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click "Sign Up" in the navigation bar or visit the registration page. You can choose to be a Driver, Host, or Both. Fill in your details and you\'ll be ready to start!'
        },
        {
          q: 'How do I find parking?',
          a: 'Use the search bar on the homepage or navigate to the Search page. Enter your location, dates, and number of guests. Browse available listings and book your spot!'
        },
        {
          q: 'How do I list my parking space?',
          a: 'If you\'re a Host, go to your Dashboard and click "Create New Listing". Fill in your parking space details, set your prices, and start earning!'
        }
      ]
    },
    {
      category: 'Booking & Payments',
      questions: [
        {
          q: 'How do I book a parking spot?',
          a: 'Search for available spots, select one that fits your needs, choose your dates and times, enter your vehicle information, and proceed to payment. You\'ll receive a confirmation once payment is processed.'
        },
        {
          q: 'What payment methods are accepted?',
          a: 'We accept all major credit cards, debit cards, and digital payment methods through our secure Stripe integration.'
        },
        {
          q: 'Can I cancel a booking?',
          a: 'Cancellation policies vary by listing. Check the listing details before booking. You can cancel from your Bookings page, and refunds will be processed according to the host\'s cancellation policy.'
        },
        {
          q: 'How do I extend my parking time?',
          a: 'Go to your booking details page and click "Extend Booking". Select your new end time and complete the payment for the additional time.'
        }
      ]
    },
    {
      category: 'Hosting',
      questions: [
        {
          q: 'How much can I earn?',
          a: 'Earnings depend on your location, pricing, and availability. Check your Earnings page in the Host Dashboard to see your current earnings and analytics.'
        },
        {
          q: 'How do I set my prices?',
          a: 'When creating or editing a listing, you can set both hourly and daily rates. Consider your location, nearby competition, and demand when setting prices.'
        },
        {
          q: 'How do I block dates?',
          a: 'Go to your listing details page and use the "Block Dates" feature. Select the dates you want to block and optionally add a reason.'
        },
        {
          q: 'What if a driver doesn\'t show up?',
          a: 'If a driver doesn\'t arrive within the booking window, you can report it through the booking details page. Our support team will review and handle the situation.'
        }
      ]
    },
    {
      category: 'Safety & Security',
      questions: [
        {
          q: 'How is my payment information protected?',
          a: 'We use industry-standard encryption and secure payment processing through Stripe. Your payment information is never stored on our servers.'
        },
        {
          q: 'What if there\'s damage to my vehicle?',
          a: 'Contact support immediately if you experience any issues. We recommend taking photos before and after parking. Our support team will help resolve disputes.'
        },
        {
          q: 'How are hosts verified?',
          a: 'All hosts must verify their identity and provide accurate listing information. We review listings and monitor for quality and safety.'
        }
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-gray-600 text-lg">
            Find answers to common questions and learn how to get the most out of BRIGAP
          </p>
        </motion.div>

        <div className="space-y-6">
          {faqs.map((section, sectionIndex) => (
            <FloatingCard key={sectionIndex} delay={sectionIndex * 0.1}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.category}</h2>
              <div className="space-y-4">
                {section.questions.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: sectionIndex * 0.1 + index * 0.05 }}
                    className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                    <p className="text-gray-600">{faq.a}</p>
                  </motion.div>
                ))}
              </div>
            </FloatingCard>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-2">Still need help?</h3>
          <p className="text-gray-600 mb-4">
            Can't find what you're looking for? Contact our support team.
          </p>
          <Link
            href="mailto:support@brigap.com"
            className="inline-block px-6 py-3 bg-gradient-to-r from-car-neon to-car-electric text-white rounded-lg hover:from-car-neon/90 hover:to-car-electric/90 transition-all font-semibold shadow-md"
          >
            Contact Support
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

