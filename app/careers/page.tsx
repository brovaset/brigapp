'use client'

import { motion } from 'framer-motion'
import FloatingCard from '@/components/FloatingCard'

export default function CareersPage() {
  const benefits = [
    'Competitive salary and equity packages',
    'Comprehensive health, dental, and vision insurance',
    'Flexible work arrangements and remote options',
    'Professional development opportunities',
    'Generous paid time off and holidays',
    '401(k) matching program',
    'Stock options for all employees',
    'Team building events and activities'
  ]

  const openPositions = [
    {
      title: 'Senior Full-Stack Developer',
      department: 'Engineering',
      location: 'Remote / San Francisco, CA',
      type: 'Full-time'
    },
    {
      title: 'Product Designer',
      department: 'Design',
      location: 'Remote / New York, NY',
      type: 'Full-time'
    },
    {
      title: 'Customer Success Manager',
      department: 'Operations',
      location: 'Remote',
      type: 'Full-time'
    },
    {
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'Remote / Los Angeles, CA',
      type: 'Full-time'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Careers at BRIGAP</h1>
          <p className="text-xl text-gray-600">
            Join us in revolutionizing urban parking
          </p>
        </motion.div>

        <FloatingCard delay={0.1}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Work at BRIGAP?</h2>
          <p className="text-gray-600 mb-6">
            At BRIGAP, we're building the future of urban mobility. We're a fast-growing startup with a mission to make parking accessible, efficient, and sustainable. Join a team of passionate individuals who are making a real impact on how people move through cities.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <svg className="w-4 h-4 text-car-electric mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </FloatingCard>

        <div className="my-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Open Positions</h2>
          <div className="space-y-4">
            {openPositions.map((position, index) => (
              <FloatingCard key={index} delay={0.2 + index * 0.1}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{position.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>{position.department}</span>
                      <span>•</span>
                      <span>{position.location}</span>
                      <span>•</span>
                      <span>{position.type}</span>
                    </div>
                  </div>
                  <a
                    href="mailto:careers@brigap.com?subject=Application for {position.title}"
                    className="px-4 py-2 bg-gradient-to-r from-car-neon to-car-electric text-white rounded-lg hover:from-car-neon/90 hover:to-car-electric/90 transition-all text-sm font-semibold whitespace-nowrap"
                  >
                    Apply Now
                  </a>
                </div>
              </FloatingCard>
            ))}
          </div>
        </div>

        <FloatingCard delay={0.6}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Don't See a Fit?</h2>
          <p className="text-gray-600 mb-4">
            We're always looking for talented individuals to join our team. Even if you don't see a position that matches your skills, we'd love to hear from you.
          </p>
          <a
            href="mailto:careers@brigap.com"
            className="inline-block px-6 py-3 bg-gradient-to-r from-car-neon to-car-electric text-white rounded-lg hover:from-car-neon/90 hover:to-car-electric/90 transition-all font-semibold shadow-md"
          >
            Send Us Your Resume
          </a>
        </FloatingCard>
      </div>
    </div>
  )
}

