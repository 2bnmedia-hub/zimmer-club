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

export const CATEGORIES = [
  { key: 'couples',   href: '/search?amenity=couples',        label: 'רומנטי',              emoji: '💑', description: 'נכסים מושלמים לזוגות' },
  { key: 'families',  href: '/search?amenity=families',       label: 'מתאים למשפחות',       emoji: '👨‍👩‍👧‍👦', description: 'מרחב ונוחות לכל המשפחה' },
  { key: 'villa',     href: '/search?category=villa',         label: 'וילות יוקרה',         emoji: '🏰', description: 'חוויה יוקרתית ומפנקת' },
  { key: 'pets',      href: '/search?amenity=pets',           label: 'ידידותי לבעלי חיים',  emoji: '🐾', description: 'גם הכלב מוזמן' },
  { key: 'pool',      href: '/search?amenity=pool',           label: 'עם בריכה',            emoji: '🏊', description: 'קירור וכיף במים' },
  { key: 'jacuzzi',   href: '/search?amenity=jacuzzi',        label: "עם ג'קוזי",           emoji: '🛁', description: 'רגיעה מוחלטת' },
  { key: 'shelter',   href: '/search?amenity=shelter_nearby', label: 'עם מרחב מוגן',        emoji: '🛡️', description: 'בטחון ורוגע' },
]

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
// PROPERTY AMENITIES — source of truth
// category 'feature' = displayed in "מה יש בנכס"
// category 'audience' = displayed in "קהל יעד"
// ===========================

export const PROPERTY_AMENITIES = [
  // מתקנים ושירותים
  { key: 'pool',            label: 'בריכה',                       category: 'feature' },
  { key: 'private_pool',   label: 'בריכה פרטית',                 category: 'feature' },
  { key: 'heated_pool',    label: 'בריכה מחוממת',                 category: 'feature' },
  { key: 'jacuzzi',        label: "ג'קוזי",                       category: 'feature' },
  { key: 'private_jacuzzi',label: "ג'קוזי פרטי",                  category: 'feature' },
  { key: 'sauna',          label: 'סאונה',                        category: 'feature' },
  { key: 'spa',            label: 'ספא צמוד',                    category: 'feature' },
  { key: 'wifi',           label: 'WiFi',                         category: 'feature' },
  { key: 'parking',        label: 'חניה',                        category: 'feature' },
  { key: 'bbq',            label: 'ברביקיו',                     category: 'feature' },
  { key: 'ac',             label: 'מיזוג אוויר',                 category: 'feature' },
  { key: 'kitchen',        label: 'מטבח',                        category: 'feature' },
  { key: 'outdoor_kitchen',label: 'מטבח חוץ',                    category: 'feature' },
  { key: 'dining_room',    label: 'חדר אוכל',                    category: 'feature' },
  { key: 'fireplace',      label: 'קמין',                        category: 'feature' },
  { key: 'garden',         label: 'גינה',                        category: 'feature' },
  { key: 'sea_view',       label: 'נוף לים',                     category: 'feature' },
  { key: 'mountain_view',  label: 'נוף להרים',                   category: 'feature' },
  { key: 'gym',            label: 'חדר כושר',                    category: 'feature' },
  { key: 'ev_charging',    label: 'עמדת טעינה לרכב חשמלי',       category: 'feature' },
  { key: 'smart_tv',       label: 'טלוויזיה חכמה',               category: 'feature' },
  { key: 'baby_cot',       label: 'עריסה לתינוק',                category: 'feature' },
  { key: 'wheelchair',     label: 'נגיש לנכים',                  category: 'feature' },
  { key: 'shelter',        label: 'מרחב מוגן',                   category: 'feature' },
  { key: 'shelter_nearby', label: 'מרחב מוגן קרוב',              category: 'feature' },
  { key: 'pets',           label: 'ידידותי לכלבים',              category: 'feature' },
  { key: 'snooker',        label: 'שולחן סנוקר',                 category: 'feature' },
  { key: 'ping_pong',      label: 'שולחן פינג-פונג',             category: 'feature' },
  { key: 'suite',          label: 'סוויטה',                      category: 'feature' },
  { key: 'treehouse',      label: 'בקתת עץ',                    category: 'feature' },
  { key: 'cave',           label: 'צימר מערה',                   category: 'feature' },
  { key: 'mobile',         label: 'צימר מבודד',                  category: 'feature' },
  { key: 'longstay',       label: 'צימרים לטווח ארוך',           category: 'feature' },
  { key: 'vacation',       label: 'דירת נופש',                   category: 'feature' },
  // קהל יעד
  { key: 'couples',        label: 'מתאים לזוגות',                category: 'audience' },
  { key: 'families',       label: 'מתאים למשפחות',               category: 'audience' },
  { key: 'groups',         label: 'מתאים לקבוצות',               category: 'audience' },
  { key: 'animals',        label: 'מקבלים בעלי חיים',            category: 'audience' },
  { key: 'guests',         label: 'מתאים לאירועים',              category: 'audience' },
  { key: 'religious',      label: 'מתאים לדתיים',                category: 'audience' },
  { key: 'accessible',     label: 'נגישות מלאה',                 category: 'audience' },
] as const

export type AmenityKey = typeof PROPERTY_AMENITIES[number]['key']

// רשומת מפתח→תווית לכל האמניטיז
export const AMENITY_LABELS: Record<string, string> = Object.fromEntries(
  PROPERTY_AMENITIES.map(a => [a.key, a.label])
)

// רשימת feature בלבד (לסקציה "מה יש בנכס" בחיפוש)
export const FEATURE_AMENITIES = PROPERTY_AMENITIES
  .filter(a => a.category === 'feature')
  .map(a => a.key)

// קהל יעד בלבד (לסקציה "קהל יעד" בחיפוש)
export const AUDIENCE_AMENITIES: Record<string, string> = Object.fromEntries(
  PROPERTY_AMENITIES.filter(a => a.category === 'audience').map(a => [a.key, a.label])
)

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
    { href: '/attractions?region=north', label: 'אטרקציות בצפון' },
    { href: '/attractions?region=galil_west', label: 'אטרקציות בגליל המערבי' },
    { href: '/attractions?region=galil_upper', label: 'אטרקציות בגליל העליון' },
    { href: '/attractions?region=galil_lower', label: 'אטרקציות בגליל התחתון' },
    { href: '/attractions?region=kinneret', label: 'אטרקציות בכנרת' },
    { href: '/attractions?region=hermon', label: 'אטרקציות בחרמון' },
    { href: '/attractions?region=center', label: 'אטרקציות במרכז' },
    { href: '/attractions?region=jerusalem', label: 'אטרקציות בירושלים' },
    { href: '/attractions?region=dead_sea', label: 'אטרקציות בים המלח' },
    { href: '/attractions?region=negev', label: 'אטרקציות בדרום' },
    { href: '/attractions?region=eilat', label: 'אטרקציות באילת' },
  ],
  byAudience: [
    { href: '/attractions?category=couples', label: 'אטרקציות לזוגות' },
    { href: '/attractions?category=family', label: 'אטרקציות למשפחות' },
    { href: '/attractions?category=kids', label: 'אטרקציות לילדים' },
    { href: '/attractions?category=groups', label: 'אטרקציות לקבוצות' },
  ],
  popular: [
    { href: '/attractions?type=rayzi',      label: 'רייזרים' },
    { href: '/attractions?type=climbing',   label: 'קיר טיפוס' },
    { href: '/attractions?type=laser_tag',  label: 'לייזר טאג' },
    { href: '/attractions?type=horses',     label: 'רכיבה על סוסים' },
    { href: '/attractions?type=karting',    label: 'קארטינג' },
    { href: '/attractions?type=water_park', label: 'פארק מים' },
  ],
}
export const VILLAS_MENU: { byRegion: { href: string; label: string }[]; byAudience: { href: string; label: string }[]; byFeatures: { href: string; label: string }[] } = {
  byRegion: [
        { href: '/search?category=villa&region=north', label: 'וילות בצפון' },
    { href: '/search?category=villa&region=center', label: 'וילות במרכז' },
    { href: '/search?category=villa&region=negev', label: 'וילות בדרום' },
    { href: '/search?category=villa&region=galil_west', label: 'וילות בגליל מערבי' },
    { href: '/search?category=villa&region=galil_upper', label: 'וילות בגליל עליון' },
    { href: '/search?category=villa&region=golan', label: 'וילות ברמת הגולן' },
    { href: '/search?category=villa&region=kinneret', label: 'וילות בכנרת' },
    { href: '/search?category=villa&region=jerusalem', label: 'וילות בירושלים' },
    { href: '/search?category=villa&region=center', label: 'וילות במישור החוף' },
    { href: '/search?category=villa&region=eilat', label: 'וילות באילת' },
    { href: '/search?category=villa&region=negev', label: 'וילות בנגב' },
    { href: '/search?category=villa&region=dead_sea', label: 'וילות בים המלח' },
  ],
  byAudience: [
    { href: '/search?category=villa&amenity=couples', label: 'וילות לזוגות' },
    { href: '/search?category=villa&amenity=families', label: 'וילות למשפחות' },
    { href: '/search?category=villa&amenity=groups', label: 'וילות לקבוצות' },
    { href: '/search?category=villa&amenity=luxury', label: 'וילות יוקרתיות' },
    { href: '/search?category=villa&amenity=couples', label: 'וילות רומנטיות' },
  ],
  byFeatures: [
    { href: '/search?category=villa&instant=true', label: 'וילות לטווח קצר' },
    { href: '/search?category=villa&amenity=pets', label: 'וילות לבעלי חיים' },
    { href: '/search?category=villa&amenity=heated_pool', label: 'וילות עם בריכה מחוממת' },
    { href: '/search?category=villa&amenity=pool', label: 'וילות עם בריכה' },
  ],
}
export const ZIMMER_MENU = {
  byRegion: [
    { href: '/search?region=north', label: 'צימרים בצפון' },
 { href: '/search?region=galil_west', label: 'צימרים בגליל המערבי' },
   { href: '/search?region=galil_upper', label: 'צימרים בגליל העליון' },
 { href: '/search?region=galil_lower', label: 'צימרים בגליל התחתון' },
 { href: '/search?region=kinneret', label: 'צימרים בכנרת' },
 { href: '/search?region=hermon', label: 'צימרים בחרמון' },
    { href: '/search?region=center', label: 'צימרים במרכז' },
    { href: '/search?region=jerusalem', label: 'צימרים בירושלים' },
    { href: '/search?region=dead_sea', label: 'צימרים בים המלח' },
    { href: '/search?region=negev', label: 'צימרים בדרום' },
       { href: '/search?region=eilat', label: 'צימרים באילת' },   
  ],
byAudience: [
  { href: '/search?amenity=religious', label: 'צימרים לדתיים' },  
    { href: '/search?amenity=families', label: 'צימרים למשפחות' },  
  { href: '/search?amenity=heated_pool', label: 'בריכה מחוממת' },
    { href: '/search?amenity=pool', label: 'צימרים עם בריכה' },
    { href: '/search?amenity=couples', label: 'צימרים לזוגות' },
        { href: '/search?amenity=shelter_nearby', label: 'צימרים עם מרחב מוגן' },
  ],
  byAvailability: [
    { href: '/search?instant=true', label: 'צימרים פנויים' },
    { href: '/search?available=weekend', label: 'צימרים בסוף השבוע הקרוב' },
    { href: '/search?available=last', label: 'צימרים ברגע אחרון' },
      
  ],



}

// ===========================
// CARAVANS
// ===========================

export const CARAVAN_TYPES = [
  { value: 'auto',      label: 'אוטו קרוואן' },
  { value: 'trailer',   label: 'קרוואן נגרר' },
  { value: 'stationed', label: 'קרוואן ממוקם' },
  { value: 'truck',     label: 'קרוואן משאית' },
]

export const CARAVAN_MENU = {
  byType: [
    { href: '/caravans?type=auto',      label: 'אוטו קרוואן' },
    { href: '/caravans?type=trailer',   label: 'קרוואן נגרר' },
    { href: '/caravans?type=stationed', label: 'קרוואן ממוקם' },
    { href: '/caravans?type=truck',     label: 'קרוואן משאית' },
  ],
  byRegion: [
    { href: '/caravans?region=north',     label: 'קרוואנים בצפון' },
    { href: '/caravans?region=center',    label: 'קרוואנים במרכז' },
    { href: '/caravans?region=jerusalem', label: 'קרוואנים בירושלים' },
    { href: '/caravans?region=dead_sea',  label: 'קרוואנים בים המלח' },
    { href: '/caravans?region=negev',     label: 'קרוואנים בדרום' },
    { href: '/caravans?region=eilat',     label: 'קרוואנים באילת' },
    { href: '/caravans?region=golan',     label: 'קרוואנים ברמת הגולן' },
  ],
  byFeature: [
    { href: '/caravans?instant=true',    label: 'זמינים מיידית' },
    { href: '/caravans?relocate=true',   label: 'כולל הצבה' },
    { href: '/caravans?guests=4',        label: 'עד 4 אורחים' },
    { href: '/caravans?guests=6',        label: 'עד 6 אורחים' },
  ],
}
