'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { IconStar, IconUser, IconSend, IconX } from '@/components/icons'

type TableName = 'reviews' | 'caravan_reviews' | 'attraction_reviews'
type ForeignKey = 'property_id' | 'caravan_id' | 'attraction_id'

type Review = {
  id: string
  rating: number
  comment?: string | null
  text?: string | null
  reviewer_name?: string | null
  created_at: string
  profiles?: { full_name: string }
}

function StarRating({ value, size = 'sm' }: {
  value: number; onChange?: (v: number) => void; size?: 'sm' | 'md' | 'lg'
}) {
  const px = size === 'lg' ? 20 : 16
  const stars = Math.round((value / 10) * 5)
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={px} height={px} viewBox="0 0 24 24"
          fill={i <= stars ? '#FBBF24' : 'none'}
          stroke={i <= stars ? '#FBBF24' : '#D1D5DB'} strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  )
}

function SliderRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label?: string }) {
  const pct = value > 0 ? ((value - 1) / 9) * 100 : 0
  const getColor = (v: number) => {
    if (v <= 0) return '#9ca3af'
    const hue = Math.round(120 - ((v - 1) / 9) * 120)
    return `hsl(${hue}, 100%, 45%)`
  }
  const color = getColor(value)
  const emoji = value >= 9 ? '🤩' : value >= 7 ? '😊' : value >= 5 ? '😐' : value > 0 ? '😕' : '💫'
  return (
    <div className="w-full">
      <style>{`
        .slider-thumb-g::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px; height: 24px;
          border-radius: 50%;
          background: white;
          border: 3px solid ${color};
          box-shadow: 0 2px 10px rgba(0,0,0,0.25);
          cursor: grab;
          transition: transform 0.15s, border-color 0.2s;
        }
        .slider-thumb-g::-webkit-slider-thumb:active { transform: scale(1.25); cursor: grabbing; }
        .slider-thumb-g::-moz-range-thumb {
          width: 24px; height: 24px; border-radius: 50%;
          background: white; border: 3px solid ${color};
          box-shadow: 0 2px 10px rgba(0,0,0,0.25); cursor: grab;
        }
      `}</style>
      <div className="flex items-center justify-between mb-2">
        {label && <span className="text-xs font-bold text-gray-700">{label}</span>}
        <div className="flex items-center gap-1 mr-auto">
          <span className="text-base">{emoji}</span>
          <span className="text-xl font-black transition-all duration-200" style={{color}}>{value > 0 ? value : '—'}</span>
          <span className="text-xs text-gray-400 mt-1">/10</span>
        </div>
      </div>
      <div className="relative h-5 rounded-full overflow-hidden" style={{
        background: 'linear-gradient(to right, hsl(120,100%,40%), hsl(90,100%,42%), hsl(60,100%,45%), hsl(30,100%,45%), hsl(0,100%,45%))',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15)'
      }}>
        <div className="absolute inset-y-0 right-0 bg-gray-200/70 transition-all duration-150 rounded-r-full"
          style={{width: `${100 - pct}%`}} />
        <input type="range" min="1" max="10" value={value || 5}
          onChange={e => onChange(Number(e.target.value))}
          className="slider-thumb-g absolute inset-0 w-full h-full bg-transparent cursor-pointer"
          style={{WebkitAppearance:'none', appearance:'none'}} />
      </div>
      <div className="flex justify-between text-xs mt-1.5 px-0.5 select-none">
        {[1,2,3,4,5,6,7,8,9,10].map(n => (
          <span key={n} style={{
            color: value === n ? '#111827' : value >= n ? getColor(n) : '#9ca3af',
            fontWeight: value === n ? '900' : '400',
            fontSize: value === n ? '13px' : '11px',
            transition: 'all 0.15s'
          }}>{n}</span>
        ))}
      </div>
    </div>
  )
}

interface GenericReviewsProps {
  entityId: string
  table: TableName
  foreignKey: ForeignKey
}

export function GenericReviews({ entityId, table, foreignKey }: GenericReviewsProps) {
  const supabase = createClient()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  useEffect(() => { loadReviews(); loadUser() }, [])

  async function loadReviews() {
    const selectFields = '*'
    const { data } = await supabase
      .from(table)
      .select(selectFields)
      .eq(foreignKey, entityId)
      .order('created_at', { ascending: false })
    setReviews((data as any) || [])
    setLoading(false)
  }

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
    setUser({ ...user, name: profile?.full_name || user.email })
    const { data: existing } = await supabase.from(table).select('id').eq(foreignKey, entityId).eq('user_id', user.id).single()
    if (existing) setSubmitted(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || rating === 0) return
    setSubmitting(true)
    const insertData: any = {
      [foreignKey]: entityId,
      user_id: user.id,
      rating,
    }
    if (table === 'reviews') {
      insertData.text = comment || null
      insertData.reviewer_name = user.name
    } else {
      insertData.comment = comment || null
    }
    await supabase.from(table).insert(insertData)
    setSubmitted(true)
    setShowForm(false)
    loadReviews()
    setSubmitting(false)
  }

  const getReviewText = (r: Review) => r.text || r.comment || null
  const getReviewerName = (r: Review) => r.reviewer_name || r.profiles?.full_name || 'אורח'
  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null

  return (
    <div className="border-t border-gray-100 pt-6 mt-6">
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: '#8B6914' }}>
            <IconStar className="w-4 h-4" />כתוב חוות דעת
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-5">חוות הדעת שלך</h3>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">דירוג כללי *</label>
            <SliderRating value={rating} onChange={setRating} />
          </div>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">ספר על החוויה שלך</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} maxLength={500}
              placeholder="שתף את האורחים הבאים בחוויה שלך..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-600 resize-none" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting || rating === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50"
              style={{ backgroundColor: '#8B6914' }}>
              <IconSend className="w-4 h-4" />{submitting ? 'שולח...' : 'פרסם חוות דעת'}
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
          <a href="/auth/login" className="font-medium hover:underline" style={{color:'#8B6914'}}>התחבר</a> כדי להשאיר חוות דעת
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-400 text-sm">טוען...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">אין עדיין חוות דעת — היה הראשון!</div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background:'linear-gradient(135deg, rgba(196,149,106,0.3), rgba(27,94,59,0.2))'}}>
                    <IconUser className="w-5 h-5" style={{color:'#C4956A'}} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{getReviewerName(r)}</p>
                    <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('he-IL', {year:'numeric',month:'long',day:'numeric'})}</p>
                  </div>
                </div>
<div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} viewBox="0 0 24 24" width="14" height="14"
                      fill={i <= Math.round((r.rating/10)*5) ? "#FBBF24" : "none"}
                      stroke={i <= Math.round((r.rating/10)*5) ? "#FBBF24" : "#D1D5DB"} strokeWidth="1.5">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                  <span className="text-xs font-bold text-gray-600">{r.rating}/10</span>
                </div>
              </div>
              {getReviewText(r) && <p className="text-sm text-gray-700 leading-relaxed">{getReviewText(r)}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
