// ===========================
// USER TYPES
// ===========================

export type UserRole = 'guest' | 'owner' | 'admin'

export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  avatar_url?: string
  role: UserRole
  created_at: string
}

// ===========================
// PROPERTY TYPES
// ===========================

export type PropertyStatus = 'active' | 'pending' | 'inactive' | 'rejected'

export type PropertyCategory =
  | 'romantic'      // רומנטי
  | 'family'        // משפחתי
  | 'luxury'        // יוקרה
  | 'pet_friendly'  // ידידותי לבעלי חיים
  | 'nature'        // טבע
  | 'beach'         // חוף ים
  | 'desert'        // מדבר

export type Region =
  | 'galil'         // גליל
  | 'carmel'        // כרמל
  | 'jerusalem'     // ירושלים
  | 'dead_sea'      // ים המלח
  | 'negev'         // נגב וערבה
  | 'center'        // מרכז
  | 'golan'         // גולן

export interface PropertyImage {
  id: string
  url: string
  alt: string
  is_primary: boolean
  order: number
}

export interface PropertyAmenity {
  id: string
  key: string
  label_he: string
  icon: string
}

export interface Property {
  id: string
  slug?: string
  owner_id: string
  name: string
  description: string
  short_description: string
  category: PropertyCategory[]
  region: Region
  city: string
  address: string
  lat: number
  lng: number
  price_per_night: number
  price_weekend?: number
  min_nights: number
  max_guests: number
  bedrooms: number
  bathrooms: number
  status: PropertyStatus
  amenities: PropertyAmenity[]
  images: PropertyImage[]
  avg_rating: number
  total_reviews: number
  instant_book: boolean
  accepts_miluim?: boolean
  has_shelter?: boolean
  phone_landline?: string
  whatsapp1?: string
  whatsapp2?: string
  contact_via_phone_landline?: boolean
  contact_via_whatsapp1?: boolean
  contact_via_whatsapp2?: boolean
  created_at: string
  updated_at: string
}

// ===========================
// BOOKING TYPES
// ===========================

export type BookingStatus =
  | 'pending'      // ממתין לאישור
  | 'confirmed'    // מאושר
  | 'cancelled'    // בוטל
  | 'completed'    // הושלם
  | 'rejected'     // נדחה

export interface Booking {
  id: string
  property_id: string
  guest_id: string
  owner_id: string
  check_in: string
  check_out: string
  guests_count: number
  total_nights: number
  price_per_night: number
  total_price: number
  advance_payment: number
  status: BookingStatus
  special_requests?: string
  payment_intent_id?: string
  created_at: string
  updated_at: string
  property?: Property
  guest?: User
}

// ===========================
// REVIEW TYPES
// ===========================

export interface Review {
  id: string
  property_id: string
  booking_id: string
  guest_id: string
  rating: number
  comment: string
  created_at: string
  guest?: User
}

// ===========================
// SEARCH TYPES
// ===========================

export interface SearchFilters {
  region?: Region
  check_in?: string
  check_out?: string
  guests?: number
  min_price?: number
  max_price?: number
  categories?: PropertyCategory[]
  amenities?: string[]
  instant_book?: boolean
  min_rating?: number
}

export interface SearchResult {
  properties: Property[]
  total: number
  page: number
  per_page: number
}

// ===========================
// AVAILABILITY
// ===========================

export interface BlockedDate {
  id: string
  property_id: string
  date: string
  reason?: string
}

// ===========================
// DASHBOARD STATS
// ===========================

export interface OwnerStats {
  total_properties: number
  total_bookings: number
  pending_bookings: number
  monthly_revenue: number
  total_revenue: number
  avg_rating: number
}

export interface AdminStats {
  total_users: number
  total_properties: number
  total_bookings: number
  monthly_revenue: number
  pending_approvals: number
  active_properties: number
}

// ===========================
// NOTIFICATIONS
// ===========================

export type NotificationType =
  | 'booking_new'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'review_new'
  | 'payment_received'
  | 'property_approved'
  | 'property_rejected'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  link?: string
  created_at: string
}
