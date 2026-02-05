'use client'

import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  color?: 'cyan' | 'pink' | 'purple'
  label?: string
}

export default function LoadingSpinner({
  size = 'md',
  className = '',
  color = 'cyan',
  label,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-[3px]',
  }

  const colorClasses = {
    cyan: 'border-car-neon border-t-transparent',
    pink: 'border-car-speed border-t-transparent',
    purple: 'border-car-turbo border-t-transparent',
  }

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full`}
        aria-hidden="true"
      />
      {label && (
        <p className="text-gray-600 text-sm font-medium">{label}</p>
      )}
    </div>
  )
}

