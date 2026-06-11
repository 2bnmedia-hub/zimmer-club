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

function StarRating({ value, onChange, size = 'md' }: {
  value: number; onChange?: (v: number) => void; size?: 'sm' | 'md' | 'lg'
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
          className={onChange ? 'cursor-pointer' : 'cursor-default'}>
          <IconStar className={`${sz} transition-colors ${i <= (hovered || value) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
        </button>
      ))}
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
    const selectFields = table === 'reviews' ? '*' : '*, profiles(full_name)'
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
            <StarRating value={rating} onChange={setRating} size="lg" />
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
                <StarRating value={r.rating} size="sm" />
              </div>
              {getReviewText(r) && <p className="text-sm text-gray-700 leading-relaxed">{getReviewText(r)}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
