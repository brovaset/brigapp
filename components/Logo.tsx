'use client'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const px = { sm: 32, md: 44, lg: 72 }[size]
  const textSize = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' }[size]
  const isRow = className.includes('flex-row')

  return (
    <div className={`flex ${isRow ? 'flex-row items-center gap-2' : 'flex-col items-center gap-2'} ${className}`}>
      <svg width={px} height={px} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* White fill */}
        <circle cx="50" cy="50" r="48" fill="#fff" />
        {/* Orange ring */}
        <circle cx="50" cy="50" r="45" stroke="#f97316" strokeWidth="5" fill="none" />
        {/* Car body */}
        <path
          d="M22 58 L22 50 L28 44 L50 44 L72 44 L78 50 L78 58 L72 64 L28 64 Z"
          stroke="#111111" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* Windows */}
        <rect x="32" y="47" width="13" height="9" rx="1.5" stroke="#111111" strokeWidth="4" />
        <rect x="55" y="47" width="13" height="9" rx="1.5" stroke="#111111" strokeWidth="4" />
        {/* Wheels */}
        <circle cx="36" cy="64" r="6" stroke="#111111" strokeWidth="4" />
        <circle cx="64" cy="64" r="6" stroke="#111111" strokeWidth="4" />
      </svg>

      {showText && (
        <span className={`font-bold tracking-tight text-gray-900 ${textSize}`}>BRIGAP</span>
      )}
    </div>
  )
}
