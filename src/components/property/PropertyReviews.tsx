'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { IconUser, IconSend, IconTrash, IconPencil, IconCheck, IconX } from '@/components/icons'

type Review = {
  id: string
  rating: number
  cleanliness: number | null
  service: number | null
  location: number | null
  facilities: number | null
  text: string | null
  reviewer_name: string | null
  created_at: string
}

const CATEGORIES = [
  { key: 'cleanliness', label: 'ניקיון' },
  { key: 'service', label: 'שירות' },
  { key: 'location', label: 'מיקום' },
  { key: 'facilities', label: 'מתקנים' },
]

function SliderRating({ value, onChange, label }: { value: number; onChange?: (v: number) => void; label?: string }) {
  const pct = value > 0 ? ((value - 1) / 9) * 100 : 0
  const getColor = (v: number) => {
    if (v <= 0) return '#9ca3af'
    const hue = Math.round(120 - ((v - 1) / 9) * 120)
    return `hsl(${hue}, 100%, 45%)`
  }
  const color = getColor(value)
  const emoji = value >= 9 ? '🤩' : value >= 7 ? '😊' : value >= 5 ? '😐' : value > 0 ? '😕' : '💫'

  if (!onChange) {
    return (
      <div className="flex items-center gap-2">
        {label && <span className="text-xs text-gray-500">{label}</span>}
        <div className="relative h-2 rounded-full overflow-hidden w-20" style={{background:'linear-gradient(to right, hsl(0,100%,45%), hsl(60,100%,45%), hsl(120,100%,40%))', border:'1px solid rgba(0,0,0,0.08)'}}>
          <div className="absolute inset-y-0 right-0 bg-gray-100 rounded-r-full" style={{width:`${100-pct}%`}} />
        </div>
        <span className="text-xs font-bold" style={{color}}>{value}/10</span>
      </div>
    )
  }

  return (
    <div className="w-full">
      <style>{`
        .srt::-webkit-slider-thumb {
          -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%;
          background: white; border: 3px solid ${color};
          box-shadow: 0 2px 10px rgba(0,0,0,0.25); cursor: grab; transition: transform 0.15s;
        }
        .srt::-webkit-slider-thumb:active { transform: scale(1.25); cursor: grabbing; }
        .srt::-moz-range-thumb { width: 22px; height: 22px; border-radius: 50%;
          background: white; border: 3px solid ${color}; box-shadow: 0 2px 10px rgba(0,0,0,0.25); }
      `}</style>
      <div className="flex items-center justify-between mb-1">
        {label && <span className="text-xs font-bold text-gray-700">{label}</span>}
        <div className="flex items-center gap-1 mr-auto">
          <span className="text-sm">{emoji}</span>
          <span className="text-lg font-black" style={{color}}>{value > 0 ? value : '—'}</span>
          <span className="text-xs text-gray-400">/10</span>
        </div>
      </div>
      <div className="relative h-4 rounded-full overflow-hidden" style={{background:'linear-gradient(to right, hsl(0,100%,45%), hsl(60,100%,45%), hsl(120,100%,40%))', boxShadow:'inset 0 2px 4px rgba(0,0,0,0.15)'}}>
        <div className="absolute inset-y-0 right-0 bg-gray-200/70 rounded-r-full" style={{width:`${100-pct}%`}} />
        <input type="range" min="1" max="10" value={value||5} onChange={e => onChange(Number(e.target.value))}
          className="srt absolute inset-0 w-full h-full bg-transparent cursor-pointer" style={{WebkitAppearance:'none', appearance:'none'}} />
      </div>
      <div className="flex justify-between text-xs mt-1 px-0.5 select-none">
        {[1,2,3,4,5,6,7,8,9,10].map(n => (
          <span key={n} style={{color: value===n ? '#111827' : value>=n ? getColor(n) : '#9ca3af', fontWeight: value===n ? '900' : '400', fontSize: value===n ? '13px' : '11px'}}>{n}</span>
        ))}
      </div>
    </div>
  )
}

function ReviewCard({ review, isAdmin, onUpdate, onDelete }: {
  review: Review
  isAdmin: boolean
  onUpdate: (id: string, data: Partial<Review>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<Review>>({})
  const [saving, setSaving] = useState(false)

  const startEdit = () => {
    setForm({ rating: review.rating, cleanliness: review.cleanliness, service: review.service, location: review.location, facilities: review.facilities, text: review.text, reviewer_name: review.reviewer_name })
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    await onUpdate(review.id, form)
    setEditing(false)
    setSaving(false)
  }

  const date = new Date(review.created_at).toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      {editing ? (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">שם המבקר</label>
            <input value={form.reviewer_name || ''} onChange={e => setForm(p => ({...p, reviewer_name: e.target.value}))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-600" />
          </div>
          <SliderRating value={form.rating || 0} onChange={v => setForm(p => ({...p, rating: v}))} label="דירוג כללי" />
          <div className="grid grid-cols-2 gap-4">
            {CATEGORIES.map(cat => (
              <SliderRating key={cat.key} value={(form as any)[cat.key] || 0} onChange={v => setForm(p => ({...p, [cat.key]: v}))} label={cat.label} />
            ))}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">טקסט</label>
            <textarea value={form.text || ''} onChange={e => setForm(p => ({...p, text: e.target.value}))}
              rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-600 resize-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
              <IconCheck className="w-4 h-4" color="white" />{saving ? 'שומר...' : 'שמור'}
            </button>
            <button onClick={() => setEditing(false)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50">
              <IconX className="w-4 h-4" color="#4b5563" />ביטול
            </button>
          </div>
        </div>
      ) : (
        <>
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
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                <span className="text-sm font-black" style={{color:`hsl(${Math.round(120-((review.rating-1)/9*120))},100%,38%)`}}>{review.rating}</span>
                <span className="text-xs text-gray-400">/10</span>
              </div>
              {isAdmin && (
                <div className="flex gap-1">
                  <button onClick={startEdit} className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 transition-colors">
                    <IconPencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(review.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <IconTrash className="w-4 h-4" color="#9ca3af" />
                  </button>
                </div>
              )}
            </div>
          </div>
          {review.text && <p className="text-sm text-gray-700 leading-relaxed mb-3">{review.text}</p>}
          {(review.cleanliness || review.service || review.location || review.facilities) && (
            <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-50">
              {CATEGORIES.map(cat => {
                const val = (review as any)[cat.key] as number | null
                if (!val) return null
                return <SliderRating key={cat.key} value={val} label={cat.label} />
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function PropertyReviews({ propertyId }: { propertyId: string }) {
  const supabase = createClient()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ rating: 0, cleanliness: 0, service: 0, location: 0, facilities: 0, text: '' })

  useEffect(() => {
    loadReviews()
    loadUser()

    const channel = supabase.channel(`reviews-${propertyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews', filter: `property_id=eq.${propertyId}` }, () => loadReviews())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function loadReviews() {
    const { data } = await supabase.from('reviews').select('*').eq('property_id', propertyId).order('created_at', { ascending: false })
    setReviews(data || [])
    setLoading(false)
  }

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single()
    setUser({ ...user, name: profile?.full_name || user.email })
    if (profile?.role === 'admin') setIsAdmin(true)
    const { data: existing } = await supabase.from('reviews').select('id').eq('property_id', propertyId).eq('user_id', user.id).single()
    if (existing) setSubmitted(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || form.rating === 0) return
    setSubmitting(true)
    await supabase.from('reviews').insert({
      property_id: propertyId, user_id: user.id,
      rating: form.rating, cleanliness: form.cleanliness || null, service: form.service || null,
      location: form.location || null, facilities: form.facilities || null,
      text: form.text || null, reviewer_name: user.name,
    })
    setSubmitted(true)
    setShowForm(false)
    setSubmitting(false)
  }

  async function handleUpdate(id: string, data: Partial<Review>) {
    const cleanData: any = {
      rating: Number(data.rating),
      text: data.text || null,
      reviewer_name: data.reviewer_name || null,
      cleanliness: data.cleanliness ? Number(data.cleanliness) : null,
      service: data.service ? Number(data.service) : null,
      location: data.location ? Number(data.location) : null,
      facilities: data.facilities ? Number(data.facilities) : null,
    }
    const { error } = await supabase.from('reviews').update(cleanData).eq('id', id)
    if (error) { alert('שגיאה בשמירה: ' + error.message); return }
    await loadReviews()
    const { data: allReviews } = await supabase.from('reviews').select('rating').eq('property_id', propertyId)
    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((s: number, r: any) => s + r.rating, 0) / allReviews.length
      await supabase.from('properties').update({ avg_rating: Math.round(avg * 10) / 10, total_reviews: allReviews.length }).eq('id', propertyId)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('למחוק ביקורת זו?')) return
    await supabase.from('reviews').delete().eq('id', id)
  }

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null

  return (
    <div className="border-t border-gray-100 pt-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-gray-900 text-lg">חוות דעת</h2>
          {avg && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl" style={{background:'#f9fafb', border:'1px solid #e5e7eb'}}>
              <span className="font-black text-gray-900">{avg}</span>
              <span className="text-xs text-gray-500">/ 10 ({reviews.length})</span>
            </div>
          )}
        </div>
        {user && !submitted && !showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: '#8B6914' }}>
            כתוב חוות דעת
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-5">חוות הדעת שלך</h3>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">דירוג כללי *</label>
            <SliderRating value={form.rating} onChange={v => setForm(p => ({...p, rating: v}))} />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            {CATEGORIES.map(cat => (
              <SliderRating key={cat.key} value={(form as any)[cat.key]} onChange={v => setForm(p => ({...p, [cat.key]: v}))} label={cat.label} />
            ))}
          </div>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">ספר על החוויה שלך</label>
            <textarea value={form.text} onChange={e => setForm(p => ({...p, text: e.target.value}))} rows={4} maxLength={500}
              placeholder="שתף את האורחים הבאים בחוויה שלך..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-600 resize-none" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting || form.rating === 0}
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
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 mb-6">
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
            <ReviewCard key={r.id} review={r} isAdmin={isAdmin} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
