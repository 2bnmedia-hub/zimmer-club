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

type P = { size?: number; className?: string; style?: React.CSSProperties; color?: string; 'aria-hidden'?: boolean | 'true' | 'false' }

export const IconSearch = ({ size = 20, className, style, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} aria-hidden={ah}>
    {!color && grad(id)}
    <circle cx="11" cy="11" r="7" stroke={color || s(id)} strokeWidth="1.8"/>
    <path d="M16.5 16.5L21 21" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconUser = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <circle cx="12" cy="8" r="4" stroke={s(id)} strokeWidth="1.8"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconMenu = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <path d="M3 6h18M3 12h18M3 18h18" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconX = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M18 6L6 18M6 6l12 12" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconChevronDown = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M6 9l6 6 6-6" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconLogOut = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M16 17l5-5-5-5" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12H9" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconSettings = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <circle cx="12" cy="12" r="3" stroke={s(id)} strokeWidth="1.8"/>
    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconStar = ({ size = 20, className, color, filled, 'aria-hidden': ah = true }: P & { filled?: boolean }) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      fill={filled ? (color || s(id)) : 'none'}/>
  </svg>
  )
}

export const IconHeart = ({ size = 20, className, filled, 'aria-hidden': ah = true }: P & { filled?: boolean }) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
      stroke={s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      fill={filled ? s(id) : 'none'}/>
  </svg>
  )
}

export const IconMapPin = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke={color || s(id)} strokeWidth="1.8"/>
    <circle cx="12" cy="10" r="3" stroke={color || s(id)} strokeWidth="1.8"/>
  </svg>
  )
}

export const IconBed = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <path d="M2 4v16M2 8h20v12M2 8c0-2.2 1.8-4 4-4h12c2.2 0 4 1.8 4 4" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M6 8v4M10 12h8" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconUsers = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <circle cx="9" cy="7" r="4" stroke={s(id)} strokeWidth="1.8"/>
    <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconCalendar = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <rect x="3" y="4" width="18" height="18" rx="2" stroke={s(id)} strokeWidth="1.8"/>
    <path d="M16 2v4M8 2v4M3 10h18" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconPhone = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconArrowRight = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <path d="M5 12h14M12 5l7 7-7 7" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconZap = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    {color === 'green' ? (
      <defs>
        <linearGradient id={`${id}green`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00854E" />
          <stop offset="100%" stopColor="#004d2e" />
        </linearGradient>
      </defs>
    ) : null}
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color === 'green' ? `url(#${id}green)` : s(id, color)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconEye = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color || s(id)} strokeWidth="1.8"/>
    <circle cx="12" cy="12" r="3" stroke={color || s(id)} strokeWidth="1.8"/>
  </svg>
  )
}

export const IconEyeOff = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M1 1l22 22" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconUpload = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M17 8l-5-5-5 5M12 3v12" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconTrash = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconEdit = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconPlus = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <path d="M12 5v14M5 12h14" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconCheck = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M20 6L9 17l-5-5" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconGlobe = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <circle cx="12" cy="12" r="10" stroke={s(id)} strokeWidth="1.8"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" stroke={s(id)} strokeWidth="1.8"/>
  </svg>
  )
}

export const IconNavigation = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <path d="M3 11l19-9-9 19-2-8-8-2z" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconHome = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M9 22V12h6v10" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconMail = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <rect x="2" y="4" width="20" height="16" rx="2" stroke={color || s(id)} strokeWidth="1.8"/>
    <path d="M2 8l10 6 10-6" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconQr = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <rect x="3" y="3" width="7" height="7" stroke={s(id)} strokeWidth="1.8" rx="1"/>
    <rect x="14" y="3" width="7" height="7" stroke={s(id)} strokeWidth="1.8" rx="1"/>
    <rect x="3" y="14" width="7" height="7" stroke={s(id)} strokeWidth="1.8" rx="1"/>
    <path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 17v3" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconShare = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <circle cx="18" cy="5" r="3" stroke={s(id)} strokeWidth="1.8"/>
    <circle cx="6" cy="12" r="3" stroke={s(id)} strokeWidth="1.8"/>
    <circle cx="18" cy="19" r="3" stroke={s(id)} strokeWidth="1.8"/>
    <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke={s(id)} strokeWidth="1.8"/>
  </svg>
  )
}

export const IconDownload = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M7 10l5 5 5-5M12 15V3" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconSend = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconRefresh = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <path d="M23 4v6h-6" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1 20v-6h6" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconSparkles = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" stroke={s(id)} strokeWidth="1.8" strokeLinejoin="round" fill={s(id)} fillOpacity="0.15"/>
    <path d="M19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75L19 3z" stroke={s(id)} strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M5 15l.75 2.25L8 18l-2.25.75L5 21l-.75-2.25L2 18l2.25-.75L5 15z" stroke={s(id)} strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconBath = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <path d="M3 10h18v4a6 6 0 01-6 6H9a6 6 0 01-6-6v-4z" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M7 10V5a2 2 0 012-2h1" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M5 20l-1 2M19 20l1 2" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconTrendingUp = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <path d="M23 6l-9.5 9.5-5-5L1 18" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 6h6v6" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconLoader = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconCamera = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="12" cy="13" r="4" stroke={s(id)} strokeWidth="1.8"/>
  </svg>
  )
}

export const IconSave = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M17 21v-8H7v8M7 3v5h8" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconAlertCircle = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <circle cx="12" cy="12" r="10" stroke={s(id)} strokeWidth="1.8"/>
    <path d="M12 8v4M12 16h.01" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconCheckCircle = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <circle cx="12" cy="12" r="10" stroke={color || s(id)} strokeWidth="1.8"/>
    <path d="M9 12l2 2 4-4" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconClock = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <circle cx="12" cy="12" r="10" stroke={s(id)} strokeWidth="1.8"/>
    <path d="M12 6v6l4 2" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconSliders = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M1 14h6M9 8h6M17 16h6" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconChevronLeft = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M15 18l-6-6 6-6" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconChevronRight = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M9 18l6-6-6-6" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconChevronUp = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M18 15l-6-6-6 6" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconZoomIn = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <circle cx="11" cy="11" r="8" stroke={s(id)} strokeWidth="1.8"/>
    <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconZoomOut = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <circle cx="11" cy="11" r="8" stroke={s(id)} strokeWidth="1.8"/>
    <path d="M21 21l-4.35-4.35M8 11h6" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconPencil = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconShield = ({ size = 20, className, filled, color, 'aria-hidden': ah = true }: P & { filled?: boolean }) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M12 3l7 3v5c0 4.5-2.9 8.2-7 9.5-4.1-1.3-7-5-7-9.5V6l7-3z"
      stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      fill={filled ? (color || s(id)) : 'none'}/>
    {filled && <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>}
  </svg>
  )
}

export const IconMedal = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M8.5 3L6 9l3 2M15.5 3L18 9l-3 2" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="15" r="6" stroke={color || s(id)} strokeWidth="1.8"/>
    <path d="M12 12.5l1.1 2.2 2.4.35-1.75 1.7.4 2.4-2.15-1.13-2.15 1.13.4-2.4-1.75-1.7 2.4-.35L12 12.5z"
      stroke={color || s(id)} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconPriceTag = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <path d="M12.6 3H5a2 2 0 00-2 2v7.6c0 .53.21 1.04.59 1.41l8.4 8.4a2 2 0 002.82 0l6-6a2 2 0 000-2.82l-8.4-8.4A2 2 0 0012.6 3z"
      stroke={s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="8" cy="8" r="1.4" fill={s(id)}/>
  </svg>
  )
}

export const IconTarget = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <circle cx="12" cy="12" r="8.5" stroke={s(id)} strokeWidth="1.8"/>
    <circle cx="12" cy="12" r="4.5" stroke={s(id)} strokeWidth="1.8"/>
    <circle cx="12" cy="12" r="1.2" fill={s(id)}/>
  </svg>
  )
}

export const IconCaravan = ({ size = 20, className, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {grad(id)}
    <path d="M2.5 15V8a1 1 0 011-1h13.5a2 2 0 012 2v6" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.5 15h17.5M19 11h2.5v4H19" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="7" cy="18" r="1.8" stroke={s(id)} strokeWidth="1.8"/>
    <circle cx="16.5" cy="18" r="1.8" stroke={s(id)} strokeWidth="1.8"/>
    <path d="M6 8V5.5" stroke={s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconBell = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.73 21a2 2 0 01-3.46 0" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconBuilding = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <rect x="4" y="3" width="16" height="18" rx="1.5" stroke={color || s(id)} strokeWidth="1.8"/>
    <path d="M8 7h1M8 11h1M8 15h1M15 7h1M15 11h1M15 15h1" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M10 21v-4h4v4" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconTent = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M12 3l9 17H3l9-17z" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 3v17M8 20l4-8 4 8" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconFile = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M6 2h9l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 2v6h6" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconPaperclip = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M21.44 11.05l-9.19 9.19a5.5 5.5 0 01-7.78-7.78l9.19-9.19a3.5 3.5 0 015 5l-9.2 9.19a1.5 1.5 0 01-2.12-2.12l8.49-8.48" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconPawPrint = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <circle cx="12" cy="16.5" r="4" stroke={color || s(id)} strokeWidth="1.8"/>
    <circle cx="6.5" cy="10.5" r="2.1" stroke={color || s(id)} strokeWidth="1.8"/>
    <circle cx="17.5" cy="10.5" r="2.1" stroke={color || s(id)} strokeWidth="1.8"/>
    <circle cx="9.5" cy="6" r="1.9" stroke={color || s(id)} strokeWidth="1.8"/>
    <circle cx="14.5" cy="6" r="1.9" stroke={color || s(id)} strokeWidth="1.8"/>
  </svg>
  )
}

export const IconWaves = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M2 8c1.5-1.5 3.5-1.5 5 0s3.5 1.5 5 0 3.5-1.5 5 0 3.5 1.5 5 0" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M2 14c1.5-1.5 3.5-1.5 5 0s3.5 1.5 5 0 3.5-1.5 5 0 3.5 1.5 5 0" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M2 20c1.5-1.5 3.5-1.5 5 0s3.5 1.5 5 0 3.5-1.5 5 0 3.5 1.5 5 0" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconPalmTree = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M12 22V11" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M12 11c0-3.5-2.5-6-6-6.5C6.3 8 8.7 10.5 12 11z" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 11c0-3.8 2.7-6.3 6.5-6.8C18.3 8 15.6 10.6 12 11z" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 10.5c-.5-2.8-2.7-4.7-5.5-4.7C7 8.3 9.3 10 12 10.5z" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconCactus = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M12 21V8a3 3 0 013-3" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 12H8a2 2 0 01-2-2V7" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 16h4a2 2 0 002-2v-3" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 21h8" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconSnowflake = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M12 2v20M4.2 7l15.6 9M4.2 16l15.6-9" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M8.5 4.5L12 7l3.5-2.5M8.5 19.5L12 17l3.5 2.5M4.8 10.5L4.2 7l3.3-1.2M4.8 13.5L4.2 17l3.3 1.2M19.2 10.5l.6-3.5-3.3-1.2M19.2 13.5l.6 3.5-3.3 1.2" stroke={color || s(id)} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconWheat = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M12 21V4" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M12 6c-2 0-3.5-1.3-3.5-3.3C10.5 2.7 12 4 12 6zM12 6c2 0 3.5-1.3 3.5-3.3C13.5 2.7 12 4 12 6z" stroke={color || s(id)} strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M12 10c-2 0-3.5-1.3-3.5-3.3M12 10c2 0 3.5-1.3 3.5-3.3" stroke={color || s(id)} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 14c-2 0-3.5-1.3-3.5-3.3M12 14c2 0 3.5-1.3 3.5-3.3" stroke={color || s(id)} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 18c-2 0-3.5-1.3-3.5-3.3M12 18c2 0 3.5-1.3 3.5-3.3" stroke={color || s(id)} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
  )
}

export const IconTree = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M12 2L6 11h3l-4 6h5v5h4v-5h5l-4-6h3L12 2z" stroke={color || s(id)} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconMountain = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M3 19L9.5 7l4 6.5L16 11l5 8H3z" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconSunset = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M17 17a5 5 0 00-10 0" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M12 3v6M4.5 8.5l2 2M19.5 8.5l-2 2" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M2 21h20M2 17h3M19 17h3" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconShirt = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M8 3L3 6.5l2.5 3L7 8.5V21h10V8.5l1.5 1 2.5-3L16 3l-2 1.5h-4L8 3z" stroke={color || s(id)} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconDroplet = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M12 3s6.5 7.2 6.5 11.5a6.5 6.5 0 01-13 0C5.5 10.2 12 3 12 3z" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconCandle = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M12 2c1 1.3 1.6 2.2 1.6 3.1 0 .9-.7 1.4-1.6 1.4s-1.6-.5-1.6-1.4C10.4 4.2 11 3.3 12 2z" stroke={color || s(id)} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="8.5" y="8" width="7" height="13" rx="1" stroke={color || s(id)} strokeWidth="1.8"/>
    <path d="M8.5 12h7" stroke={color || s(id)} strokeWidth="1.4"/>
  </svg>
  )
}

export const IconUtensils = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M7 2v8M5 2v5.5a2 2 0 002 2 2 2 0 002-2V2M7 12v10" stroke={color || s(id)} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 2c-1.7 0-3 2-3 5s1.3 5 3 5v10" stroke={color || s(id)} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconPlug = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M9 3v5M15 3v5M6.5 8h11v4a5.5 5.5 0 01-11 0V8z" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 17.5V21" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
  )
}

export const IconLightbulb = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M9 18h6M10 21h4" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M12 2a7 7 0 00-4 12.7c.6.5 1 1.2 1 2.3h6c0-1.1.4-1.8 1-2.3A7 7 0 0012 2z" stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

export const IconMessageCircle = ({ size = 20, className, color, 'aria-hidden': ah = true }: P) => {
  const id = React.useId()
  return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    {!color && grad(id)}
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
      stroke={color || s(id)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  )
}

type BrandP = { size?: number; className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }

export const IconFacebook = ({ size = 20, className, 'aria-hidden': ah = true }: BrandP) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden={ah}>
    <path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.4c0-.87.24-1.46 1.5-1.46h1.6V4.35C16.3 4.24 15.4 4 14.35 4 12.15 4 10.65 5.34 10.65 7.8v2.7H8.1v3h2.55V21h2.85z"/>
  </svg>
)

export const IconInstagram = ({ size = 20, className, 'aria-hidden': ah = true }: BrandP) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ah}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.7"/>
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7"/>
    <circle cx="17.2" cy="6.8" r="1.15" fill="currentColor"/>
  </svg>
)

export const IconTikTok = ({ size = 20, className, 'aria-hidden': ah = true }: BrandP) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden={ah}>
    <path d="M16.6 5.2c.7.9 1.7 1.5 2.9 1.6v2.7c-1.3 0-2.5-.4-3.5-1.1v5.9c0 3-2.4 5.4-5.4 5.4S5.2 17.3 5.2 14.3c0-2.9 2.3-5.3 5.2-5.4v2.8c-1.4.1-2.4 1.2-2.4 2.6 0 1.4 1.2 2.6 2.6 2.6s2.6-1.2 2.6-2.6V3.5h2.7c.1.6.4 1.2.7 1.7z"/>
  </svg>
)
