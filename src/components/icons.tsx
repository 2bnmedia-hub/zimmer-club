import React from 'react'

const grad = (id: string) => (
  <defs>
    <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#C4956A" />
      <stop offset="50%" stopColor="#F5D08A" />
      <stop offset="100%" stopColor="#8B6914" />
    </linearGradient>
  </defs>
)

const s = (id: string, customStroke?: string) => customStroke ? customStroke : `url(#${id})`

type P = { size?: number; className?: string; style?: React.CSSProperties; color?: string }

export const IconSearch = ({ size = 20, className, style, color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    {!color && grad('gs')}
    <circle cx="11" cy="11" r="7" stroke={color || s('gs')} strokeWidth="1.8"/>
    <path d="M16.5 16.5L21 21" stroke={color || s('gs')} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconUser = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gu')}
    <circle cx="12" cy="8" r="4" stroke={s('gu')} strokeWidth="1.8"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={s('gu')} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconMenu = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gm')}
    <path d="M3 6h18M3 12h18M3 18h18" stroke={s('gm')} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconX = ({ size = 20, className, color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {!color && grad('gx')}
    <path d="M18 6L6 18M6 6l12 12" stroke={color || s('gx')} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconChevronDown = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gcd')}
    <path d="M6 9l6 6 6-6" stroke={s('gcd')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const IconLogOut = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('glo')}
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={s('glo')} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M16 17l5-5-5-5" stroke={s('glo')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12H9" stroke={s('glo')} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconSettings = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gst')}
    <circle cx="12" cy="12" r="3" stroke={s('gst')} strokeWidth="1.8"/>
    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={s('gst')} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconStar = ({ size = 20, className, filled }: P & { filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gstar')}
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      stroke={s('gstar')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      fill={filled ? s('gstar') : 'none'}/>
  </svg>
)

export const IconHeart = ({ size = 20, className, filled }: P & { filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gh')}
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
      stroke={s('gh')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      fill={filled ? s('gh') : 'none'}/>
  </svg>
)

export const IconMapPin = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gmp')}
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke={s('gmp')} strokeWidth="1.8"/>
    <circle cx="12" cy="10" r="3" stroke={s('gmp')} strokeWidth="1.8"/>
  </svg>
)

export const IconBed = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gb')}
    <path d="M2 4v16M2 8h20v12M2 8c0-2.2 1.8-4 4-4h12c2.2 0 4 1.8 4 4" stroke={s('gb')} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M6 8v4M10 12h8" stroke={s('gb')} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconUsers = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gus')}
    <circle cx="9" cy="7" r="4" stroke={s('gus')} strokeWidth="1.8"/>
    <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke={s('gus')} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" stroke={s('gus')} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconCalendar = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gc')}
    <rect x="3" y="4" width="18" height="18" rx="2" stroke={s('gc')} strokeWidth="1.8"/>
    <path d="M16 2v4M8 2v4M3 10h18" stroke={s('gc')} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconPhone = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gph')}
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke={s('gph')} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconArrowRight = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gar')}
    <path d="M5 12h14M12 5l7 7-7 7" stroke={s('gar')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const IconZap = ({ size = 20, className, color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {!color && grad('gz')}
    {color === 'green' ? (
      <defs>
        <linearGradient id="gzgreen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00854E" />
          <stop offset="100%" stopColor="#004d2e" />
        </linearGradient>
      </defs>
    ) : null}
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color === 'green' ? 'url(#gzgreen)' : s('gz', color)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const IconEye = ({ size = 20, className, color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {!color && grad('gey')}
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color || s('gey')} strokeWidth="1.8"/>
    <circle cx="12" cy="12" r="3" stroke={color || s('gey')} strokeWidth="1.8"/>
  </svg>
)

export const IconEyeOff = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('geo')}
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke={s('geo')} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M1 1l22 22" stroke={s('geo')} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconUpload = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gup')}
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={s('gup')} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M17 8l-5-5-5 5M12 3v12" stroke={s('gup')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const IconTrash = ({ size = 20, className, color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {!color && grad('gt')}
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke={color || s('gt')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const IconEdit = ({ size = 20, className, color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {!color && grad('ge')}
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={color || s('ge')} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color || s('ge')} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconPlus = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gpl')}
    <path d="M12 5v14M5 12h14" stroke={s('gpl')} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconCheck = ({ size = 20, className, color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {!color && grad('gck')}
    <path d="M20 6L9 17l-5-5" stroke={color || s('gck')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const IconGlobe = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('ggl')}
    <circle cx="12" cy="12" r="10" stroke={s('ggl')} strokeWidth="1.8"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" stroke={s('ggl')} strokeWidth="1.8"/>
  </svg>
)

export const IconNavigation = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gnav')}
    <path d="M3 11l19-9-9 19-2-8-8-2z" stroke={s('gnav')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const IconHome = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('ghome')}
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke={s('ghome')} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M9 22V12h6v10" stroke={s('ghome')} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconMail = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gmail')}
    <rect x="2" y="4" width="20" height="16" rx="2" stroke={s('gmail')} strokeWidth="1.8"/>
    <path d="M2 8l10 6 10-6" stroke={s('gmail')} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconQr = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gqr')}
    <rect x="3" y="3" width="7" height="7" stroke={s('gqr')} strokeWidth="1.8" rx="1"/>
    <rect x="14" y="3" width="7" height="7" stroke={s('gqr')} strokeWidth="1.8" rx="1"/>
    <rect x="3" y="14" width="7" height="7" stroke={s('gqr')} strokeWidth="1.8" rx="1"/>
    <path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 17v3" stroke={s('gqr')} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconShare = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gsh')}
    <circle cx="18" cy="5" r="3" stroke={s('gsh')} strokeWidth="1.8"/>
    <circle cx="6" cy="12" r="3" stroke={s('gsh')} strokeWidth="1.8"/>
    <circle cx="18" cy="19" r="3" stroke={s('gsh')} strokeWidth="1.8"/>
    <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke={s('gsh')} strokeWidth="1.8"/>
  </svg>
)

export const IconDownload = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gdl')}
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={s('gdl')} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M7 10l5 5 5-5M12 15V3" stroke={s('gdl')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const IconSend = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gsend')}
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={s('gsend')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const IconRefresh = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gref')}
    <path d="M23 4v6h-6" stroke={s('gref')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1 20v-6h6" stroke={s('gref')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke={s('gref')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const IconSparkles = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gsp')}
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" stroke={s('gsp')} strokeWidth="1.8" strokeLinejoin="round" fill={s('gsp')} fillOpacity="0.15"/>
    <path d="M19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75L19 3z" stroke={s('gsp')} strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M5 15l.75 2.25L8 18l-2.25.75L5 21l-.75-2.25L2 18l2.25-.75L5 15z" stroke={s('gsp')} strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
)

export const IconBath = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gbath')}
    <path d="M3 10h18v4a6 6 0 01-6 6H9a6 6 0 01-6-6v-4z" stroke={s('gbath')} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M7 10V5a2 2 0 012-2h1" stroke={s('gbath')} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M5 20l-1 2M19 20l1 2" stroke={s('gbath')} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconTrendingUp = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gtu')}
    <path d="M23 6l-9.5 9.5-5-5L1 18" stroke={s('gtu')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 6h6v6" stroke={s('gtu')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const IconLoader = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gldr')}
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke={s('gldr')} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconCamera = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gcam')}
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke={s('gcam')} strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="12" cy="13" r="4" stroke={s('gcam')} strokeWidth="1.8"/>
  </svg>
)

export const IconSave = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gsave')}
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke={s('gsave')} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M17 21v-8H7v8M7 3v5h8" stroke={s('gsave')} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconAlertCircle = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gac')}
    <circle cx="12" cy="12" r="10" stroke={s('gac')} strokeWidth="1.8"/>
    <path d="M12 8v4M12 16h.01" stroke={s('gac')} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconCheckCircle = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gcc')}
    <circle cx="12" cy="12" r="10" stroke={s('gcc')} strokeWidth="1.8"/>
    <path d="M9 12l2 2 4-4" stroke={s('gcc')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const IconClock = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gclk')}
    <circle cx="12" cy="12" r="10" stroke={s('gclk')} strokeWidth="1.8"/>
    <path d="M12 6v6l4 2" stroke={s('gclk')} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconSliders = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gsl')}
    <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" stroke={s('gsl')} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M1 14h6M9 8h6M17 16h6" stroke={s('gsl')} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconChevronLeft = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gcl')}
    <path d="M15 18l-6-6 6-6" stroke={s('gcl')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const IconChevronRight = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gcr')}
    <path d="M9 18l6-6-6-6" stroke={s('gcr')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const IconChevronUp = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gcu')}
    <path d="M18 15l-6-6-6 6" stroke={s('gcu')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const IconZoomIn = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gzi')}
    <circle cx="11" cy="11" r="8" stroke={s('gzi')} strokeWidth="1.8"/>
    <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" stroke={s('gzi')} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconZoomOut = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gzo')}
    <circle cx="11" cy="11" r="8" stroke={s('gzo')} strokeWidth="1.8"/>
    <path d="M21 21l-4.35-4.35M8 11h6" stroke={s('gzo')} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const IconPencil = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {grad('gpen')}
    <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke={s('gpen')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
