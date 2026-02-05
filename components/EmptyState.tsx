'use client'

import { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-xl border border-gray-200/80 shadow-sm ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-5 text-gray-400">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-sm mb-6 leading-relaxed">{description}</p>
      {action}
    </div>
  )
}
