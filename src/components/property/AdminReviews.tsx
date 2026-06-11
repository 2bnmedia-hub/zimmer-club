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
  user_id: string | null
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <button key={i} type="button"
          onClick={() => onChange?.(i)}
          onMouseEnter={() => onChange && setHovered(i)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}>
          <svg width={16} height={16} viewBox="0 0 24 24"
            fill={i <= (hovered || value) ? '#FBBF24' : 'none'}
            stroke={i <= (hovered || value) ? '#FBBF24' : '#D1D5DB'}
            strokeWidth="1.5">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </button>
      ))}
    </div>
  )
}

export function AdminReviews({ propertyId }: { propertyId: string }) {
  const supabase = createClient()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Review>>({})

  useEffect(() => { loadReviews() }, [])

  async function loadReviews() {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
    setReviews(data || [])
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('למחוק את הביקורת הזו לצמיתות?')) return
    await supabase.from('reviews').delete().eq('id', id)
    setReviews(prev => prev.filter(r => r.id !== id))
  }

  function startEdit(review: Review) {
    setEditingId(review.id)
    setEditForm({
      rating: review.rating,
      cleanliness: review.cleanliness,
      service: review.service,
      location: review.location,
      text: review.text,
      reviewer_name: review.reviewer_name,
    })
  }

  async function handleSave(id: string) {
    const { error } = await supabase.from('reviews').update({
      rating: editForm.rating,
      cleanliness: editForm.cleanliness || null,
      service: editForm.service || null,
      location: editForm.location || null,
      text: editForm.text || null,
      reviewer_name: editForm.reviewer_name,
    }).eq('id', id)

    if (!error) {
      setReviews(prev => prev.map(r => r.id === id ? { ...r, ...editForm } as Review : r))
      setEditingId(null)
    }
  }

  if (loading) return <div className="text-sm text-gray-400 py-4">טוען ביקורות...</div>

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="font-bold text-gray-700 text-lg mb-4">
        ניהול ביקורות
        <span className="mr-2 text-sm font-normal text-gray-400">({reviews.length})</span>
      </h2>

      {reviews.length === 0 ? (
        <p className="text-sm text-gray-400">אין ביקורות לנכס זה</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="border border-gray-100 rounded-xl p-4">
              {editingId === review.id ? (
                /* מצב עריכה */
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">שם המבקר</label>
                    <input
                      value={editForm.reviewer_name || ''}
                      onChange={e => setEditForm(p => ({...p, reviewer_name: e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-yellow-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">דירוג כללי</label>
                    <StarRating value={editForm.rating || 0} onChange={v => setEditForm(p => ({...p, rating: v}))} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[{key:'cleanliness',label:'ניקיון'},{key:'service',label:'שירות'},{key:'location',label:'מיקום'}].map(cat => (
                      <div key={cat.key}>
                        <label className="text-xs text-gray-500 block mb-1">{cat.label}</label>
                        <StarRating
                          value={(editForm[cat.key as keyof typeof editForm] as number) || 0}
                          onChange={v => setEditForm(p => ({...p, [cat.key]: v}))}
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">טקסט</label>
                    <textarea
                      value={editForm.text || ''}
                      onChange={e => setEditForm(p => ({...p, text: e.target.value}))}
                      rows={3}
                      maxLength={500}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-yellow-600 resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleSave(review.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                      <IconCheck className="w-4 h-4" /> שמור
                    </button>
                    <button onClick={() => setEditingId(null)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50">
                      <IconX className="w-4 h-4" /> ביטול
                    </button>
                  </div>
                </div>
              ) : (
                /* מצב תצוגה */
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{review.reviewer_name || 'אורח'}</p>
                      <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('he-IL')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating value={review.rating} />
                      <button onClick={() => startEdit(review)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 transition-colors">
                        <IconPencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(review.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {review.text && <p className="text-sm text-gray-600">{review.text}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
