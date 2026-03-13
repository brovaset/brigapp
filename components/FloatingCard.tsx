'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface FloatingCardProps {
  children: ReactNode
  delay?: number
  className?: string
  glowColor?: 'neon' | 'electric' | 'turbo' | 'neutral' | 'cyan' | 'pink' | 'purple' | 'gradient'
}

const accentMap: Record<string, string> = {
  neon: 'border-l-car-neon',
  electric: 'border-l-car-electric',
  turbo: 'border-l-car-turbo',
  neutral: 'border-l-gray-300',
  cyan: 'border-l-car-neon',
  pink: 'border-l-car-turbo',
  purple: 'border-l-car-turbo',
  gradient: 'border-l-purple-400',
}

export default function FloatingCard({
  children,
  delay = 0,
  className = '',
  glowColor = 'neon',
}: FloatingCardProps) {
  const accent = accentMap[glowColor] ?? accentMap.neon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`
        relative overflow-hidden rounded-xl p-6
        bg-white border border-gray-200/80 border-l-4 ${accent}
        shadow-sm hover:shadow-md transition-shadow duration-200
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}
