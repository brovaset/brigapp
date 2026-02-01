'use client'

import { motion } from 'framer-motion'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: { circle: 40, car: 20, text: 'text-lg' },
    md: { circle: 60, car: 30, text: 'text-2xl' },
    lg: { circle: 100, car: 50, text: 'text-4xl' },
  }

  const { circle, car, text } = sizeClasses[size]

  const isHorizontal = className.includes('flex-row')
  const containerClass = isHorizontal ? 'flex-row items-center gap-2' : 'flex-col items-center gap-2'

  return (
    <div className={`flex ${containerClass} ${className}`}>
      {/* Circular Logo with Car */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <svg
          width={circle}
          height={circle}
          viewBox="0 0 100 100"
          className="drop-shadow-lg"
        >
          {/* Background circle for contrast */}
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="#ffffff"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
          
          {/* Outer Circle - Bright Green, thicker */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#34c759"
            strokeWidth="5"
          />
          
          {/* Car - Black, thick strokes for maximum visibility */}
          <g>
            {/* Car Body */}
            <path
              d="M 25 60 L 25 50 L 30 45 L 50 45 L 70 45 L 75 50 L 75 60 L 70 65 L 30 65 Z"
              fill="none"
              stroke="#000000"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Windows */}
            <rect
              x="35"
              y="48"
              width="12"
              height="8"
              fill="none"
              stroke="#000000"
              strokeWidth="4"
              rx="1"
            />
            <rect
              x="53"
              y="48"
              width="12"
              height="8"
              fill="none"
              stroke="#000000"
              strokeWidth="4"
              rx="1"
            />
            
            {/* Wheels */}
            <circle
              cx="38"
              cy="65"
              r="6"
              fill="none"
              stroke="#000000"
              strokeWidth="4"
            />
            <circle
              cx="62"
              cy="65"
              r="6"
              fill="none"
              stroke="#000000"
              strokeWidth="4"
            />
          </g>
        </svg>
      </motion.div>

      {/* BRIGAP Text */}
      {showText && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`font-bold ${text} text-gray-900 tracking-tight`}
        >
          BRIGAP
        </motion.div>
      )}
    </div>
  )
}

