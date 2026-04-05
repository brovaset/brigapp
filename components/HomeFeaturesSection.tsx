'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const FEATURES = [
  {
    num: '01',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    ),
    title: 'Find instantly',
    body: 'Search by map or address and see available spots in real time.',
  },
  {
    num: '02',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    ),
    title: 'Pay securely',
    body: 'Payments are held safely and released to hosts only after your booking completes.',
  },
  {
    num: '03',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
    title: 'Trusted hosts',
    body: 'Every host is verified. Two-way ratings keep the community honest and accountable.',
  },
]

export default function HomeFeaturesSection() {
  return (
    <>
      {/* ── Why BRIGAP ── */}
      <section className="relative border-t border-gray-100 overflow-hidden">
        {/* subtle background */}
        <div className="absolute inset-0 bg-gray-950" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-car-neon/40 to-transparent" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-widest text-car-neon uppercase mb-3">Why brigap</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Built for drivers and hosts
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-950 px-8 py-10 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-car-neon/10 border border-car-neon/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-car-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {f.icon}
                    </svg>
                  </div>
                  <span className="text-2xl font-black text-white/10 tabular-nums">{f.num}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1.5">{f.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-white py-24 border-t border-gray-100">
        <div className="max-w-xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">
              Ready to park smarter?
            </h2>
            <p className="text-gray-500 mb-10 leading-relaxed">
              Join thousands of drivers already using brigap every day.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/register?role=driver"
                className="px-7 py-3 bg-car-neon text-white font-semibold rounded-xl hover:bg-car-electric transition-colors shadow-sm text-sm"
              >
                Find parking
              </Link>
              <Link
                href="/register?role=host"
                className="px-7 py-3 bg-white text-gray-900 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm"
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
