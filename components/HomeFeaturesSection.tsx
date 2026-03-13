'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const FEATURES = [
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    ),
    title: 'Find instantly',
    body: 'Search by map or address and see available spots in real time.',
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    ),
    title: 'Pay securely',
    body: 'Payments are held safely and released to hosts after your booking.',
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
    title: 'Trusted hosts',
    body: 'Every host is verified, and two-way ratings keep the community honest.',
  },
]

export default function HomeFeaturesSection() {
  return (
    <>
      {/* Features */}
      <section className="border-t border-gray-100 bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Why BRIGAP?</h2>
            <p className="mt-2 text-gray-500">Simple, safe, and built for drivers and hosts alike.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <svg className="w-5 h-5 text-car-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {f.icon}
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Ready to park smarter?</h2>
            <p className="text-gray-500 mb-8">Join thousands of drivers already using BRIGAP every day.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/register?role=driver"
                className="px-7 py-3 bg-car-neon text-white font-semibold rounded-xl hover:bg-car-electric transition-colors shadow-md hover:shadow-lg text-sm"
              >
                Find parking
              </Link>
              <Link
                href="/register?role=host"
                className="px-7 py-3 bg-white text-gray-900 font-semibold rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm"
              >
                List your space
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
