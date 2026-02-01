'use client'

import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  color?: 'cyan' | 'pink' | 'purple'
}

export default function LoadingSpinner({
  size = 'md',
  className = '',
  color = 'cyan',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-16 h-16 border-4',
  }

  const colorClasses = {
    cyan: 'border-car-neon border-t-transparent',
    pink: 'border-car-speed border-t-transparent',
    purple: 'border-car-turbo border-t-transparent',
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full ${className}`}
    />
  )
}

