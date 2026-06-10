'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { IconSearch, IconMapPin, IconCalendar, IconUsers, IconHome, IconChevronDown, IconChevronUp, IconChevronLeft, IconChevronRight, IconStar, IconHeart, IconUser, IconPhone, IconGlobe, IconNavigation, IconArrowRight, IconZap, IconEye, IconEyeOff, IconUpload, IconTrash, IconEdit, IconPlus, IconCheck, IconMail, IconSend, IconRefresh, IconSparkles, IconBed, IconBath, IconTrendingUp, IconLoader, IconCamera, IconSave, IconAlertCircle, IconCheckCircle, IconClock, IconSliders, IconPencil, IconQr, IconShare, IconDownload, IconZoomIn, IconZoomOut, IconLogOut, IconSettings, IconMenu, IconX } from '@/components/icons'

type Review = {
  id: string
  rating: number
  cleanliness: number | null
  service: number | null
  location: number | null
  text: string | null
  reviewer_name: string | null
  created_at: string
}

const CATEGORIES = [
  { key: 'cleanliness', label: 'ניקיון' },
  { key: 'service', label: 'שירות' },
  { key: 'location', label: 'מיקום' },
]

function StarRating({ value, onChange, size = 'md' }: {
  value: number
  onChange?: (v: number) => void
  size?: 'sm' | 'md' | 'lg'
}) {
  const [hovered, setHovered] = useState(0)
  const sz = size === 'lg' ? 'w-8 h-8' : size === 'md' ? 'w-6 h-6' : 'w-4 h-4'

  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <button key={i} type="button"
          onClick={() => onChange?.(i)}
          onMouseEnter={() => onChange && setHovered(i)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          <IconStar className={`${sz} transition-colors ${
            i <= (hovered || value)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`} />
        </button>
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.created_at).toLocaleDateString('he-IL', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C4956A]/30 to-[#1B5E3B]/20 flex items-center justify-center">
            <IconUser className="w-5 h-5 text-[#C4956A]" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{review.reviewer_name || 'אורח'}</p>
            <p className="text-xs text-gray-400">{date}</p>
          </div>
        </div>
        <StarRating value={review.rating} size="sm" />
      </div>

      {review.text && (
        <p className="text-sm text-gray-700 leading-relaxed mb-3">{review.text}</p>
      )}

      {(review.cleanliness || review.service || review.location) && (
        <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-50">
          {CATEGORIES.map(cat => {
            const val = review[cat.key as keyof Review] as number | null
            if (!val) return null
            return (
              <div key={cat.key} className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500">{cat.label}</span>
                <StarRating value={val} size="sm" />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function PropertyReviews({ propertyId }: { propertyId: string }) {
  const supabase = createClient()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    rating: 0,
    cleanliness: 0,
    service: 0,
    location: 0,
    text: '',
  })

  useEffect(() => {
    loadReviews()
    loadUser()
  }, [])

  async function loadReviews() {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
    setReviews(data || [])
    setLoading(false)
  }

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    setUser({ ...user, name: profile?.full_name || user.email })

    // בדוק אם כבר השאיר חוות דעת
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('property_id', propertyId)
      .eq('user_id', user.id)
      .single()
    if (existing) setSubmitted(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (form.rating === 0) return

    setSubmitting(true)
    const { error } = await supabase.from('reviews').insert({
      property_id: propertyId,
      user_id: user.id,
      rating: form.rating,
      cleanliness: form.cleanliness || null,
      service: form.service || null,
      location: form.location || null,
      text: form.text || null,
      reviewer_name: user.name,
    })

    if (!error) {
      setSubmitted(true)
      setShowForm(false)
      loadReviews()
    }
    setSubmitting(false)
  }

  // חשב ממוצע
  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="border-t border-gray-100 pt-6 mt-6">
      {/* כותרת */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-gray-900 text-lg">חוות דעת</h2>
          {avg && (
            <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1 rounded-xl">
              <IconStar className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-gray-900">{avg}</span>
              <span className="text-xs text-gray-500">({reviews.length})</span>
            </div>
          )}
        </div>
        {user && !submitted && !showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: '#8B6914' }}>
            <IconStar className="w-4 h-4" />
            כתוב חוות דעת
          </button>
        )}
      </div>

      {/* טופס */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-5">חוות הדעת שלך</h3>

          {/* דירוג כללי */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">דירוג כללי *</label>
            <StarRating value={form.rating} onChange={v => setForm(p => ({...p, rating: v}))} size="lg" />
          </div>

          {/* קטגוריות */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            {CATEGORIES.map(cat => (
              <div key={cat.key}>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{cat.label}</label>
                <StarRating
                  value={form[cat.key as keyof typeof form] as number}
                  onChange={v => setForm(p => ({...p, [cat.key]: v}))}
                  size="sm"
                />
              </div>
            ))}
          </div>

          {/* טקסט */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">ספר על החוויה שלך</label>
            <textarea
              value={form.text}
              onChange={e => setForm(p => ({...p, text: e.target.value}))}
              rows={4}
              maxLength={500}
              placeholder="שתף את האורחים הבאים בחוויה שלך..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-600 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={submitting || form.rating === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-all"
              style={{ backgroundColor: '#8B6914' }}>
              <IconSend className="w-4 h-4" />
              {submitting ? 'שולח...' : 'פרסם חוות דעת'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-6 py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-100">
              ביטול
            </button>
          </div>
        </form>
      )}

      {submitted && !showForm && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 mb-6 flex items-center gap-2">
          <IconStar className="w-4 h-4 fill-green-500 text-green-500" />
          תודה! חוות הדעת שלך פורסמה.
        </div>
      )}

      {!user && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 mb-6">
          <a href="/auth/login" className="text-[#8B6914] font-medium hover:underline">התחבר</a> כדי להשאיר חוות דעת
        </div>
      )}

      {/* רשימת חוות דעת */}
      {loading ? (
        <div className="text-center py-8 text-gray-400 text-sm">טוען...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">אין עדיין חוות דעת — היה הראשון!</div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}
    </div>
  )
}
