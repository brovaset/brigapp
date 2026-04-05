'use client'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
  /** Pass true when the logo sits on a dark background */
  onDark?: boolean
}

export default function Logo({
  size = 'md',
  showText = true,
  className = '',
  onDark = false,
}: LogoProps) {
  const px          = { sm: 34, md: 46, lg: 76 }[size]
  const textSize    = { sm: 'text-[17px]', md: 'text-2xl', lg: 'text-4xl' }[size]

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="BRIGAP logo mark"
      >
        {/* Badge background */}
        <rect width="100" height="100" rx="22" fill="#111111" />

        {/* Subtle white border — visible on dark backgrounds, almost invisible on white */}
        {onDark && (
          <rect
            x="1.5" y="1.5" width="97" height="97"
            rx="21"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="3"
            fill="none"
          />
        )}

        {/* Subtle orange ambient glow — top-right corner */}
        <circle cx="86" cy="14" r="28" fill="#f97316" opacity="0.18" />

        {/* ── B letterform ── */}

        {/* Stem — white vertical bar */}
        <rect x="19" y="14" width="14" height="72" rx="4" fill="white" />

        {/* Upper bowl outer — white D-shape (top half) */}
        <path
          d="M33 14 L51 14 Q71 14 71 32 Q71 50 51 50 L33 50 Z"
          fill="white"
        />

        {/* Upper bowl inner — orange counter */}
        <path
          d="M33 23 L49 23 Q61 23 61 32 Q61 41 49 41 L33 41 Z"
          fill="#f97316"
        />

        {/* Lower bowl outer — white D-shape (bottom half, slightly wider) */}
        <path
          d="M33 50 L53 50 Q75 50 75 68 Q75 86 53 86 L33 86 Z"
          fill="white"
        />

        {/* Lower bowl inner — orange counter */}
        <path
          d="M33 59 L51 59 Q64 59 64 68 Q64 77 51 77 L33 77 Z"
          fill="#f97316"
        />
      </svg>

      {showText && (
        <span
          className={`font-black tracking-widest ${textSize} select-none ${
            onDark ? 'text-white' : 'text-gray-900'
          }`}
          style={{ letterSpacing: '0.12em' }}
        >
          BRIGAP
        </span>
      )}
    </div>
  )
}
