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

        {/* ── P letterform ── */}

        {/* Stem — white vertical bar */}
        <rect x="19" y="14" width="14" height="72" rx="4" fill="white" />

        {/* Bowl outer — white D-shape */}
        <path
          d="M33 14 L52 14 Q74 14 74 36 Q74 58 52 58 L33 58 Z"
          fill="white"
        />

        {/* Bowl inner — orange counter (the "hole" in the P bowl) */}
        <path
          d="M33 23 L50 23 Q63 23 63 36 Q63 49 50 49 L33 49 Z"
          fill="#f97316"
        />

        {/* Location dot — bottom right */}
        <circle cx="69" cy="77" r="10" fill="#f97316" />
        <circle cx="69" cy="77" r="5"  fill="white" />
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
