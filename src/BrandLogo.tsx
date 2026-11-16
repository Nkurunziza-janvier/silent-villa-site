import { useId, type SVGProps } from 'react'

type BrandLogoProps = {
  /** `dark` = for dark/forest backgrounds, `light` = for cream/white backgrounds */
  variant?: 'dark' | 'light'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /** The gold “GUEST HOUSE” rule under the wordmark */
  showSubtitle?: boolean
  /** The italic “Where comfort meets silence” signature line */
  showTagline?: boolean
}

/**
 * The Silent Villa emblem — a gold-line villa at golden hour inside a forest
 * medallion. Recreated as vector from the original brand artwork so it stays
 * razor sharp on every screen density.
 */
export function BrandEmblem({ className, ...props }: SVGProps<SVGSVGElement>) {
  const rawId = useId().replace(/:/g, '')
  const gold = `sv-gold-${rawId}`
  const deep = `sv-deep-${rawId}`
  const glow = `sv-glow-${rawId}`
  const lit = `sv-lit-${rawId}`

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id={gold} x1="10" y1="8" x2="54" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F8E9C4" />
          <stop offset="46%" stopColor="#D8BD84" />
          <stop offset="100%" stopColor="#A07F45" />
        </linearGradient>
        <linearGradient id={deep} x1="32" y1="2" x2="32" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2C4A37" />
          <stop offset="52%" stopColor="#1A2F23" />
          <stop offset="100%" stopColor="#0E1C15" />
        </linearGradient>
        <radialGradient id={glow} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FFE9B8" stopOpacity="0.9" />
          <stop offset="72%" stopColor="#E8C37E" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#E8C37E" stopOpacity="0" />
        </radialGradient>
        <filter id={lit} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="0.9" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Medallion */}
      <rect x="1.5" y="1.5" width="61" height="61" rx="19" fill={`url(#${deep})`} />
      <rect x="1.5" y="1.5" width="61" height="61" rx="19" stroke={`url(#${gold})`} strokeWidth="1.4" />
      <rect
        x="5.3"
        y="5.3"
        width="53.4"
        height="53.4"
        rx="15.6"
        stroke={`url(#${gold})`}
        strokeOpacity="0.24"
        strokeWidth="0.7"
      />

      {/* Golden-hour halo */}
      <circle cx="32" cy="27" r="15" fill={`url(#${glow})`} />
      <circle cx="32" cy="24.4" r="5.1" fill="#F2D193" fillOpacity="0.85" />

      {/* Palm silhouettes, nestled behind the villa */}
      <g stroke={`url(#${gold})`} strokeWidth="0.95" strokeLinecap="round" strokeOpacity="0.92">
        <path d="M9.9 47.4C10.3 44.4 11 41.6 11.8 39" />
        <path d="M11.8 39C10.1 37.2 8.3 37 6.7 38.3" />
        <path d="M11.8 39C11.6 36.6 10.5 35.2 8.6 34.9" />
        <path d="M11.8 39C13.1 37 14.6 36.5 16.1 37.4" />
        <path d="M11.8 39C13.5 38.5 14.9 39.1 15.8 40.5" />
        <path d="M54.1 47.4C53.7 44.4 53 41.6 52.2 39" />
        <path d="M52.2 39C53.9 37.2 55.7 37 57.3 38.3" />
        <path d="M52.2 39C52.4 36.6 53.5 35.2 55.4 34.9" />
        <path d="M52.2 39C50.9 37 49.4 36.5 47.9 37.4" />
        <path d="M52.2 39C50.5 38.5 49.1 39.1 48.2 40.5" />
      </g>

      {/* Taller right wing */}
      <path
        d="M30.6 47.2V31.4L39.8 22.4L49 31.4V47.2Z"
        fill="#0E1C15"
        stroke={`url(#${gold})`}
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      {/* Lower left wing */}
      <path
        d="M14.2 47.2V36.5L23.1 27.7L32 36.5V47.2Z"
        fill="#11241A"
        stroke={`url(#${gold})`}
        strokeWidth="1.25"
        strokeLinejoin="round"
      />

      {/* Warm lit windows */}
      <g fill="#F4D18F" filter={`url(#${lit})`}>
        <rect x="18.3" y="39.2" width="3.1" height="4.6" rx="0.7" />
        <rect x="24.1" y="39.2" width="3.1" height="4.6" rx="0.7" />
        <rect x="35.1" y="36.2" width="2.9" height="5.2" rx="0.7" />
        <rect x="40" y="36.2" width="2.9" height="5.2" rx="0.7" />
        <rect x="44.9" y="36.2" width="2" height="5.2" rx="0.6" fillOpacity="0.82" />
      </g>

      {/* Rolling Kigali hills / reflection */}
      <path
        d="M10.5 47.6c6.6-1.8 12-1.8 21.5-0.2 8.3 1.4 15.4 1.3 21.5-0.3"
        stroke={`url(#${gold})`}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M16 51.4c5.4-1.2 9.9-1.2 16 0 5.9 1.1 10.8 1 16-0.2"
        stroke={`url(#${gold})`}
        strokeOpacity="0.5"
        strokeWidth="1"
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
  showTagline = false,
}: BrandLogoProps) {
  const isLight = variant === 'light'

  const emblemSizes = {
    sm: 'h-9 w-9',
    md: 'h-8 w-8 min-[360px]:h-9 min-[360px]:w-9 min-[400px]:h-10 min-[400px]:w-10 sm:h-12 sm:w-12',
    lg: 'h-12 w-12 sm:h-14 sm:w-14',
  }[size]

  const wordmarkSizes = {
    sm: 'text-[15px] sm:text-base tracking-[0.17em]',
    md: 'text-[13.5px] tracking-[0.11em] min-[360px]:text-[15px] min-[360px]:tracking-[0.13em] min-[400px]:text-[16px] min-[400px]:tracking-[0.14em] sm:text-[22px] sm:tracking-[0.15em]',
    lg: 'text-[22px] sm:text-[26px] tracking-[0.14em]',
  }[size]

  const subtitleSizes = {
    sm: 'text-[7px] tracking-[0.3em]',
    md: 'text-[6.5px] tracking-[0.22em] min-[360px]:text-[7px] min-[360px]:tracking-[0.3em] min-[400px]:text-[8px] sm:text-[9px] sm:tracking-[0.38em]',
    lg: 'text-[9px] sm:text-[10px] tracking-[0.4em]',
  }[size]

  const ruleSizes = {
    sm: 'w-3',
    md: 'w-2 min-[360px]:w-2.5 min-[400px]:w-3 sm:w-6',
    lg: 'w-5 sm:w-7',
  }[size]

  const taglineSizes = {
    sm: 'text-[10px]',
    md: 'text-[10px] sm:text-[11px]',
    lg: 'text-xs sm:text-[13px]',
  }[size]

  const gap = size === 'sm' ? 'gap-2.5' : size === 'md' ? 'gap-2 min-[360px]:gap-2.5 sm:gap-3' : 'gap-3'
  const ruleTint = isLight ? 'to-[#b9995c]' : 'to-[#d8c28f]'

  return (
    <span className={`group inline-flex select-none items-center ${gap} ${className}`}>
      <span className="brand-emblem relative inline-flex shrink-0 items-center justify-center transition-transform duration-500 ease-out group-hover:scale-[1.04]">
        <BrandEmblem
          className={`${emblemSizes} relative z-10 drop-shadow-[0_7px_16px_rgba(0,0,0,0.38)]`}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[26%]"
        >
          <span className="brand-sheen absolute inset-0" />
        </span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[26%] ring-1 ring-inset ring-[#d8c28f]/25 transition duration-500 group-hover:ring-[#f2dfb4]/60"
        />
      </span>

      <span className="flex min-w-0 flex-col text-left">
        <span
          className={`font-serif font-semibold uppercase leading-none ${wordmarkSizes} ${
            isLight ? 'text-[#22392b]' : 'text-[#f7f2e7]'
          }`}
        >
          Silent Villa
        </span>

        {showSubtitle && (
          <span className="mt-1 flex items-center gap-2" aria-hidden="true">
            <span
              className={`h-px ${ruleSizes} shrink-0 bg-gradient-to-r from-transparent ${ruleTint}`}
            />
            <span
              className={`whitespace-nowrap font-sans font-semibold uppercase ${subtitleSizes} ${
                isLight ? 'text-[#96743d]' : 'text-[#d8c28f]'
              }`}
            >
              Guest House
            </span>
            <span
              className={`h-px ${ruleSizes} shrink-0 bg-gradient-to-l from-transparent ${ruleTint}`}
            />
          </span>
        )}

        {showTagline && (
          <span
            className={`mt-1 font-serif italic leading-tight ${taglineSizes} ${
              isLight ? 'text-[#8f7340]' : 'text-[#cdb782]'
            }`}
          >
            Where comfort meets silence
          </span>
        )}
      </span>
    </span>
  )
}
