'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface NeonButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  className?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

export default function NeonButton({
  children,
  onClick,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false,
}: NeonButtonProps) {
  const baseClasses = 'relative px-6 py-3 rounded-lg font-semibold overflow-hidden transition-all duration-300 transform hover:scale-105 active:scale-95'

  const variantClasses = {
    primary: 'bg-gradient-to-r from-car-neon to-car-electric text-white shadow-lg shadow-car-neon/20 hover:shadow-xl hover:shadow-car-neon/30',
    secondary: 'bg-gradient-to-r from-car-electric to-car-neon text-white shadow-lg shadow-car-electric/20 hover:shadow-xl hover:shadow-car-electric/30',
    outline: 'border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-car-neon hover:text-car-neon hover:shadow-md hover:shadow-car-neon/10',
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } relative overflow-hidden`}
      style={{
        backgroundSize: variant !== 'outline' ? '200% 200%' : '100% 100%',
      }}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  )
}

