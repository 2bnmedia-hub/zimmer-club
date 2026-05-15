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
export const ATTRACTIONS_MENU = {
  byRegion: [
    { href: '/attractions', label: 'לכל האטרקציות' },
    { href: '/attractions?region=north', label: 'אטרקציות בצפון' },
  { href: '/attractions?region=haifa', label: ' אטרקציות באיזור חיפה והקריות' },
   { href: '/attractions?region=emek', label: 'אטרקציות בעמקים' },
    { href: '/attractions?region=kinneret', label: 'אטרקציות בכנרת' },
    { href: '/attractions?region=miron', label: 'אטרקציות במירון' },
      { href: '/attractions?region=hermon', label: 'אטרקציות בחרמון' },
 { href: '/attractions?region=gilboa', label: 'אטרקציות בגלבוע' },
    { href: '/attractions?region=center', label: 'אטרקציות במרכז' },
   { href: '/attractions?region=south', label: 'אטרקציות בדרום' },
    { href: '/attractions?region=eilat', label: 'אטרקציות באילת' },
  
 
    { href: '/attractions?region=jerusalem', label: 'אטרקציות בירושלים' },
    { href: '/attractions?region=dead_sea', label: 'אטרקציות בים המלח' },
    { href: '/attractions?region=arava', label: 'אטרקציות בערבה' },
 
    
  ],
  byAudience: [
    { href: '/attractions?category=couples', label: 'אטרקציות לזוגות' },
    { href: '/attractions?category=family', label: 'אטרקציות למשפחות' },
    { href: '/attractions?category=kids', label: 'אטרקציות לילדים' },
    { href: '/attractions?category=groups', label: 'אטרקציות לקבוצות' },
  ],

}
export const VILLAS_MENU: { byRegion: { href: string; label: string }[]; byAudience: { href: string; label: string }[]; byFeatures: { href: string; label: string }[] } = {
  byRegion: [
    { href: '/villas', label: 'לכל הוילות' },
    { href: '/villas?region=north', label: 'וילות בצפון' },
    { href: '/villas?region=center', label: 'וילות במרכז' },
    { href: '/villas?region=south', label: 'וילות בדרום' },
    { href: '/villas?region=galil_west', label: 'וילות בגליל מערבי' },
    { href: '/villas?region=galil_upper', label: 'וילות בגליל עליון' },
    { href: '/villas?region=golan', label: 'וילות ברמת הגולן' },
    { href: '/villas?region=kinneret', label: 'וילות בכנרת' },
    { href: '/villas?region=jerusalem', label: 'וילות בירושלים' },
    { href: '/villas?region=coast', label: 'וילות במישור החוף' },
    { href: '/villas?region=eilat', label: 'וילות באילת' },
    { href: '/villas?region=negev', label: 'וילות בנגב' },
    { href: '/villas?region=dead_sea', label: 'וילות בים המלח' },
  ],
  byAudience: [
    { href: '/villas?type=vacation', label: 'וילות לזוגות' },
    { href: '/villas?category=family', label: 'וילות למשפחות' },
    { href: '/villas?category=groups', label: 'וילות לקבוצות' },
    { href: '/villas?category=luxury', label: 'וילות יוקרתיות' },
    { href: '/villas?category=romantic', label: 'וילות רומנטיות' },
    { href: '/villas?category=events', label: 'וילות למסיבות רוקדות' },
  ],
  byFeatures: [
    { href: '/villas?available=short', label: 'וילות לטווח קצר' },
    { href: '/villas?amenity=pets', label: 'וילות שמקבלות כלבים' },
    { href: '/villas?amenity=heated_pool', label: 'וילות עם בריכה מחוממת' },
    { href: '/villas?amenity=pool', label: 'וילות עם בריכה' },
    { href: '/villas?region=arava', label: 'וילות בערבה' },
  ],
}
export const ZIMMER_MENU = {
  byRegion: [
    { href: '/search?region=galil', label: 'צימרים בצפון' },
 { href: '/search?region=galil_west', label: 'צימרים בגליל המערבי' },
   { href: '/search?region=galil_upper', label: 'צימרים בגליל העליון' },
 { href: '/search?region=galil_lower', label: 'צימרים בגליל התחתון' },
 { href: '/search?region=galil', label: 'אירוח דרוזי' },
 { href: '/search?region=carmel', label: 'צימרים בכנרת' },
 { href: '/search?region=golan', label: 'צימרים בחרמון' },
    { href: '/search?region=center', label: 'צימרים במרכז' },
    { href: '/search?region=jerusalem', label: 'צימרים בירושלים' },
    { href: '/search?region=dead_sea', label: 'צימרים בים המלח' },
    { href: '/search?region=jerusalem', label: 'צימרים בדרום' },
       { href: '/search?region=eilat', label: 'צימרים באילת' },   
  ],
byAudience: [
  { href: '/search?category=religious', label: 'צימרים לדתיים' },  
    { href: '/search?category=family', label: 'צימרים למשפחות' },  
  { href: '/search?amenity=heated_pool', label: 'בריכה מחוממת' },
    { href: '/search?amenity=pool', label: 'צימרים עם בריכה' },
    { href: '/search?category=romantic', label: 'צימרים לזוגות' },
    { href: '/search?category=luxury', label: 'צימרים יוקרתיים' },
    { href: '/search?category=romantic', label: 'צימרים רומנטיים' },
    { href: '/search?amenity=shelter', label: 'צימרים עם מרחב מוגן' },
  ],
  byAvailability: [
    { href: '/search?instant=true', label: 'צימרים פנויים' },
    { href: '/search?available=weekend', label: 'צימרים בסוף השבוע הקרוב' },
    { href: '/search?available=last', label: 'צימרים ברגע אחרון' },
    { href: '/search?category=luxury', label: 'צימרים יוקרתיים' },
    { href: '/search?category=romantic', label: 'צימרים רומנטיים' },
  
  ],



}
