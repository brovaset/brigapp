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

const variants = {
  primary: 'bg-car-neon text-white hover:bg-car-electric shadow-sm hover:shadow-md',
  secondary: 'bg-car-electric text-white hover:bg-car-neon shadow-sm hover:shadow-md',
  outline: 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50',
}

export default function NeonButton({
  children,
  onClick,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false,
}: NeonButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.97 }}
      className={`
        px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-150
        ${variants[variant]}
        ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
        ${className}
      `}
    >
      <span className="flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  )
}
