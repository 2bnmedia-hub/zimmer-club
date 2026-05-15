import type { Region, PropertyCategory, NotificationType } from '@/types'

// ===========================
// REGIONS
// ===========================

export const REGIONS: Record<Region, { label: string; emoji: string; count?: number }> = {
  galil:     { label: 'הגליל',            emoji: '🌲' },
  carmel:    { label: 'כרמל וחוף',        emoji: '🌊' },
  jerusalem: { label: 'ירושלים והרי יהודה', emoji: '🏔️' },
  dead_sea:  { label: 'ים המלח',          emoji: '🌅' },
  negev:     { label: 'ערבה ונגב',        emoji: '🏜️' },
  center:    { label: 'מרכז הארץ',        emoji: '🌿' },
  golan:     { label: 'רמת הגולן',        emoji: '⛰️' },
}

// ===========================
// CATEGORIES
// ===========================

export const CATEGORIES: Record<PropertyCategory, { label: string; emoji: string; description: string }> = {
  romantic:    { label: 'רומנטי',           emoji: '💑', description: 'נכסים מושלמים לזוגות' },
  family:      { label: 'מתאים למשפחות',    emoji: '👨‍👩‍👧‍👦', description: 'מרחב ונוחות לכל המשפחה' },
  luxury:      { label: 'וילות יוקרה',      emoji: '🏰', description: 'חוויה יוקרתית ומפנקת' },
  pet_friendly:{ label: 'ידידותי לבעלי חיים', emoji: '🐾', description: 'גם הכלב מוזמן' },
  nature:      { label: 'טבע ושקט',         emoji: '🌿', description: 'בריחה אל הטבע' },
  beach:       { label: 'חוף ים',           emoji: '🏖️', description: 'רגלות ברמול' },
  desert:      { label: 'מדבר',             emoji: '🌵', description: 'שמי כוכבים ודממה' },
}

// ===========================
// AMENITIES
// ===========================

export const AMENITIES = [
  { key: 'jacuzzi',        label: 'ג׳קוזי',           icon: '🛁' },
  { key: 'pool',           label: 'בריכה פרטית',      icon: '🏊' },
  { key: 'wifi',           label: 'WiFi מהיר',         icon: '📶' },
  { key: 'ac',             label: 'מיזוג אוויר',       icon: '❄️' },
  { key: 'kitchen',        label: 'מטבח מאובזר',       icon: '🍳' },
  { key: 'bbq',            label: 'ברביקיו',           icon: '🔥' },
  { key: 'parking',        label: 'חניה פרטית',        icon: '🚗' },
  { key: 'fireplace',      label: 'פח אש / קמין',      icon: '🪵' },
  { key: 'mountain_view',  label: 'נוף להרים',         icon: '⛰️' },
  { key: 'sea_view',       label: 'נוף לים',           icon: '🌊' },
  { key: 'garden',         label: 'גינה פרטית',        icon: '🌳' },
  { key: 'tv',             label: 'טלוויזיה חכמה',     icon: '📺' },
  { key: 'gym',            label: 'חדר כושר',          icon: '💪' },
  { key: 'sauna',          label: 'סאונה',             icon: '🧖' },
  { key: 'baby_cot',       label: 'עריסה לתינוק',      icon: '👶' },
  { key: 'wheelchair',     label: 'נגיש לכיסא גלגלים', icon: '♿' },
]

// ===========================
// BOOKING STATUS
// ===========================

export const BOOKING_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'ממתין לאישור', color: 'amber' },
  confirmed: { label: 'מאושר',        color: 'green' },
  cancelled: { label: 'בוטל',         color: 'red' },
  completed: { label: 'הושלם',        color: 'blue' },
  rejected:  { label: 'נדחה',         color: 'red' },
}

// ===========================
// NOTIFICATION MESSAGES
// ===========================

export const NOTIFICATION_LABELS: Record<NotificationType, { title: string; icon: string }> = {
  booking_new:        { title: 'הזמנה חדשה התקבלה',   icon: '📅' },
  booking_confirmed:  { title: 'ההזמנה אושרה',         icon: '✅' },
  booking_cancelled:  { title: 'ההזמנה בוטלה',         icon: '❌' },
  review_new:         { title: 'ביקורת חדשה התקבלה',   icon: '⭐' },
  payment_received:   { title: 'תשלום התקבל',          icon: '💳' },
  property_approved:  { title: 'הנכס אושר לפרסום',     icon: '🏠' },
  property_rejected:  { title: 'הנכס נדחה',            icon: '🚫' },
}

// ===========================
// NAVIGATION
// ===========================

export const NAV_LINKS = [
  { href: '/search',    label: 'חיפוש נכסים' },
  { href: '/search?category=luxury', label: 'וילות יוקרה' },
  { href: '/search?instant=true', label: 'הזמנה מיידית' },
  { href: '/owners',   label: 'בעלי נכסים' },
]

export const ZIMMER_MENU = {
  byRegion: [
    { href: '/search', label: 'לכל הצימרים' },
    { href: '/search?region=galil', label: 'צימרים בצפון' },
    { href: '/search?region=jerusalem', label: 'צימרים בדרום' },
    { href: '/search?region=center', label: 'צימרים במרכז' },
    { href: '/search?region=carmel', label: 'צימרים בכנרת' },
    { href: '/search?region=dead_sea', label: 'צימרים בחרמון' },
    { href: '/search?region=golan', label: 'צימרים בירושלים' },
  ],
  byAudience: [
    { href: '/search?category=romantic', label: 'צימרים רומנטיים' },
    { href: '/search?category=family', label: 'צימרים למשפחות' },
    { href: '/search?amenity=pool', label: 'צימרים זולים' },
    { href: '/search?category=pet_friendly', label: 'צימרים לדתיים' },
    { href: '/search?amenity=jacuzzi', label: 'צימרים דקה 90' },
    { href: '/search?amenity=bbq', label: 'צימרים עם בריכה' },
    { href: '/search?category=luxury', label: 'צימרים לזוגות' },
  ],
  byAvailability: [
    { href: '/search?instant=true', label: 'צימרים פנויים' },
    { href: '/search?available=weekend', label: 'צימרים בסוף\u05e9 הקרוב' },
    { href: '/search?available=last', label: 'צימרים ברגע אחרון' },
    { href: '/search?category=luxury', label: 'צימרים יוקרתיים' },
    { href: '/search?category=nature', label: 'צימרים רומנטיים' },
    { href: '/search?deal=true', label: 'צימרים במבצע' },
    { href: '/search?pool=shared', label: 'צימרים עם מרחב מוגן' },
  ],
}
