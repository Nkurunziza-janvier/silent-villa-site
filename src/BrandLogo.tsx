import { type SVGProps } from 'react'

type BrandLogoProps = {
  variant?: 'dark' | 'light'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showSubtitle?: boolean
}

export function BrandEmblem(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id="sv-gold-grad" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F2DFB4" />
          <stop offset="48%" stopColor="#C9A86C" />
          <stop offset="100%" stopColor="#8E6F3E" />
        </linearGradient>
        <radialGradient id="sv-bg-glow" cx="50%" cy="38%" r="55%">
          <stop offset="0%" stopColor="#2E4537" />
          <stop offset="100%" stopColor="#142018" />
        </radialGradient>
      </defs>

      {/* Outer medallion */}
      <rect x="2" y="2" width="60" height="60" rx="18" fill="url(#sv-bg-glow)" stroke="url(#sv-gold-grad)" strokeWidth="1.5" />
      <rect x="6" y="6" width="52" height="52" rx="14" stroke="url(#sv-gold-grad)" strokeOpacity="0.28" strokeWidth="0.8" />

      {/* Sun / Horizon Halo */}
      <circle cx="32" cy="24" r="9" stroke="url(#sv-gold-grad)" strokeOpacity="0.45" strokeWidth="1" />
      <circle cx="32" cy="24" r="3" fill="url(#sv-gold-grad)" />

      {/* Architectural Villa Arch & Roofline */}
      <path
        d="M15 44V29L32 16L49 29V44"
        stroke="url(#sv-gold-grad)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23 44V31.5C23 26.5294 27.0294 22.5 32 22.5C36.9706 22.5 41 26.5294 41 31.5V44"
        stroke="url(#sv-gold-grad)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* Kigali Rolling Hills / Water Reflection Lines */}
      <path
        d="M12 44.5C19 42 25 42 32 44.5C39 47 45 47 52 44.5"
        stroke="url(#sv-gold-grad)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M18 49.5C24 47.8 28 47.8 32 49.5C36 51.2 40 51.2 46 49.5"
        stroke="url(#sv-gold-grad)"
        strokeOpacity="0.65"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function BrandLogo({
  variant = 'dark',
  size = 'md',
  className = '',
  showSubtitle = true,
}: BrandLogoProps) {
  const isLight = variant === 'light'

  const emblemSizes = {
    sm: 'h-9 w-9',
    md: 'h-11 w-11 sm:h-12 sm:w-12',
    lg: 'h-13 w-13 sm:h-14 sm:w-14',
  }[size]

  const titleSizes = {
    sm: 'text-lg sm:text-xl',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  }[size]

  return (
    <span className={`group inline-flex items-center gap-3 select-none ${className}`}>
      <span className="relative inline-flex shrink-0 items-center justify-center rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition-transform duration-500 group-hover:scale-105">
        <BrandEmblem className={emblemSizes} />
        <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#d8c28f]/30 transition duration-500 group-hover:ring-[#d8c28f]/70" />
      </span>
      <span className="flex flex-col text-left">
        <span
          className={`font-serif font-semibold leading-none tracking-[0.14em] uppercase ${titleSizes} ${
            isLight ? 'text-stone-900' : 'text-[#f7f2e7]'
          }`}
        >
          Silent Villa
        </span>
        {showSubtitle && (
          <span
            className={`mt-1 flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.28em] sm:text-[10px] ${
              isLight ? 'text-[#756047]' : 'text-[#d8c28f]'
            }`}
          >
            <span className="inline-block h-1 w-1 rounded-full bg-[#bda06b]" />
            Kigali Sanctuary
          </span>
        )}
      </span>
    </span>
  )
}
