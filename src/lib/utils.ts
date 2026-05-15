import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInDays, format, parseISO } from 'date-fns'
import { he } from 'date-fns/locale'

// Tailwind class merging
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price in ILS
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format date in Hebrew
export function formatDateHe(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd בMMMM yyyy', { locale: he })
}

// Format short date
export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy')
}

// Calculate number of nights
export function calcNights(checkIn: string, checkOut: string): number {
  return differenceInDays(parseISO(checkOut), parseISO(checkIn))
}

// Calculate total booking price
export function calcTotalPrice(pricePerNight: number, nights: number): number {
  return pricePerNight * nights
}

// Calculate advance payment (30% default)
export function calcAdvancePayment(total: number, percent = 0.3): number {
  return Math.ceil(total * percent)
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}

// Generate initials for avatar
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

// Generate slug from Hebrew + English text
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u0590-\u05FF]/g, '') // remove Hebrew
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || `property-${Date.now()}`
}

// Format relative time in Hebrew
export function timeAgoHe(date: string): string {
  const now = new Date()
  const d = parseISO(date)
  const diff = differenceInDays(now, d)

  if (diff === 0) return 'היום'
  if (diff === 1) return 'אתמול'
  if (diff < 7) return `לפני ${diff} ימים`
  if (diff < 30) return `לפני ${Math.floor(diff / 7)} שבועות`
  if (diff < 365) return `לפני ${Math.floor(diff / 30)} חודשים`
  return `לפני ${Math.floor(diff / 365)} שנים`
}

// Rating to stars string
export function ratingToStars(rating: number): string {
  return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating))
}

// Validate Israeli phone number
export function isValidIsraeliPhone(phone: string): boolean {
  const cleaned = phone.replace(/[-\s]/g, '')
  return /^(05[0-9]|02|03|04|08|09)\d{7}$/.test(cleaned)
}

// Build query string from filters
export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const filtered = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '' && v !== false)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
  return filtered.length ? '?' + filtered.join('&') : ''
}
