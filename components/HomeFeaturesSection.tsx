'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function HomeFeaturesSection() {
  const router = useRouter()

  return (
    <>
      <div className="bg-gradient-to-b from-white via-blue-50/30 to-white py-24 mt-24 border-t border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Why Choose BRIGAP?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Experience the easiest way to find and book parking</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, scale: 1.02 }}
              viewport={{ once: true }}
              className="group cursor-default text-center p-6 bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200/80 border-l-4 border-l-car-neon shadow-lg"
            >
              <div className="w-12 h-12 rounded-lg bg-car-neon/20 mb-4 flex items-center justify-center group-hover:bg-car-neon/30 group-hover:scale-110 transition-all duration-300">
                <svg className="w-6 h-6 text-car-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Easy Search</h3>
              <p className="text-gray-600">
                Find available parking spots instantly with our interactive map and smart filters.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, scale: 1.02 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group cursor-default text-center p-6 bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200/80 border-l-4 border-l-car-electric shadow-lg"
            >
              <div className="w-12 h-12 rounded-lg bg-car-electric/20 mb-4 flex items-center justify-center group-hover:bg-car-electric/30 group-hover:scale-110 transition-all duration-300">
                <svg className="w-6 h-6 text-car-electric" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Secure Payments</h3>
              <p className="text-gray-600">
                Book and pay securely with our integrated payment system. Your money is protected.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, scale: 1.02 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group cursor-default text-center p-6 bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200/80 border-l-4 border-l-car-turbo shadow-lg"
            >
              <div className="w-12 h-12 rounded-lg bg-car-turbo/20 mb-4 flex items-center justify-center group-hover:bg-car-turbo/30 group-hover:scale-110 transition-all duration-300">
                <svg className="w-6 h-6 text-car-turbo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Trusted Platform</h3>
              <p className="text-gray-600">
                Verified users, ratings, and reviews ensure a safe and reliable experience.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-car-neon/5 via-car-electric/8 to-car-neon/5 py-20 mt-24 border-t border-gray-200/50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-car-neon/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-car-electric/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 mb-10 font-medium"
          >
            Join thousands of drivers and hosts already using BRIGAP
          </motion.p>
          <div className="flex gap-4 justify-center flex-wrap">
            <motion.button
              onClick={() => router.push('/register?role=driver')}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-4 bg-gradient-to-r from-car-neon to-car-electric text-white rounded-full font-semibold shadow-xl shadow-car-neon/30 hover:shadow-2xl transition-all duration-200 text-lg"
            >
              Find Parking Now
            </motion.button>
            <motion.button
              onClick={() => router.push('/register?role=host')}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-4 bg-white text-car-neon rounded-full border-2 border-car-neon font-semibold shadow-lg hover:bg-car-neon/5 transition-all duration-200 text-lg"
            >
              List Your Space
            </motion.button>
          </div>
        </div>
      </div>
    </>
  )
}
