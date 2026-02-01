'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface FloatingCardProps {
  children: ReactNode
  delay?: number
  className?: string
  glowColor?: 'neon' | 'electric' | 'turbo' | 'neutral' | 'cyan' | 'pink' | 'purple'
}

const colorVariants = {
  neon: {
    border: 'border-l-car-neon',
    bg: 'bg-white/95 hover:bg-gradient-to-br hover:from-white hover:to-car-neon/5',
    shadow: 'shadow-lg hover:shadow-[0_8px_30px_rgba(0,122,255,0.15)]',
  },
  electric: {
    border: 'border-l-car-electric',
    bg: 'bg-white/95 hover:bg-gradient-to-br hover:from-white hover:to-car-electric/5',
    shadow: 'shadow-lg hover:shadow-[0_8px_30px_rgba(52,199,89,0.15)]',
  },
  turbo: {
    border: 'border-l-car-turbo',
    bg: 'bg-white/95 hover:bg-gradient-to-br hover:from-white hover:to-car-turbo/5',
    shadow: 'shadow-lg hover:shadow-[0_8px_30px_rgba(88,86,214,0.15)]',
  },
  neutral: {
    border: 'border-l-gray-300',
    bg: 'bg-white/95 hover:bg-gradient-to-br hover:from-white hover:to-car-neon/5',
    shadow: 'shadow-lg hover:shadow-[0_8px_30px_rgba(0,122,255,0.1)]',
  },
}

export default function FloatingCard({
  children,
  delay = 0,
  className = '',
  glowColor = 'neon',
}: FloatingCardProps) {
  const variant = colorVariants[
    glowColor === 'cyan' ? 'neon' : glowColor === 'pink' || glowColor === 'purple' ? 'turbo' : glowColor
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{
        duration: 0.8,
        delay,
        type: 'spring',
        stiffness: 100,
      }}
      whileHover={{
        y: -8,
        rotateY: 3,
        rotateX: 3,
        scale: 1.02,
        transition: { duration: 0.3 },
      }}
      whileTap={{ scale: 0.99 }}
      className={`
        relative overflow-hidden rounded-xl p-6
        border border-gray-200/80 border-l-4
        ${variant.border} ${variant.bg} ${variant.shadow}
        backdrop-blur-sm transition-all duration-300 cursor-default
        ${className}
      `}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  )
}

