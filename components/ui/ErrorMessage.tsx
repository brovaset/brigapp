'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ErrorMessageProps {
  message: string | ReactNode
  className?: string
  onClose?: () => void
}

export default function ErrorMessage({
  message,
  className = '',
  onClose,
}: ErrorMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg backdrop-blur-sm flex items-center justify-between ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-red-400 font-bold">!</span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-red-400 hover:text-red-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      )}
    </motion.div>
  )
}

