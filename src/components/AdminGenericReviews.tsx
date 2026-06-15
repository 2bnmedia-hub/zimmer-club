'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { IconStar, IconTrash, IconPencil, IconCheck, IconX } from '@/components/icons'

type TableName = 'reviews' | 'caravan_reviews' | 'attraction_reviews'
type ForeignKey = 'property_id' | 'caravan_id' | 'attraction_id'

type Review = {
  id: string
  rating: number
  cleanliness?: number | null
  service?: number | null
  location?: number | null
  facilities?: number | null
  comment?: string | null
  text?: string | null
  reviewer_name?: string | null
  created_at: string
  profiles?: { full_name: string }
}

function StarRating({ value }: { value: number; onChange?: (v: number) => void }) {
  const stars = Math.round((value / 10) * 5)
  return (
    <div className="flex gap-0.5 items-center">
      {[1,2,3,4,5].map(i => (
        <svg key={i} viewBox="0 0 24 24" width="16" height="16" fill={i <= stars ? '#FBBF24' : '#E5E7EB'}>
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      ))}
      <span className="text-xs font-bold text-gray-600 mr-1">{value}/10</span>
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
        .slider-thumb-a::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px; height: 24px; border-radius: 50%;
          background: white; border: 3px solid ${color};
          box-shadow: 0 2px 10px rgba(0,0,0,0.25); cursor: grab;
          transition: transform 0.15s;
        }
        .slider-thumb-a::-webkit-slider-thumb:active { transform: scale(1.25); cursor: grabbing; }
        .slider-thumb-a::-moz-range-thumb {
          width: 24px; height: 24px; border-radius: 50%;
          background: white; border: 3px solid ${color};
          box-shadow: 0 2px 10px rgba(0,0,0,0.25); cursor: grab;
        }
      `}</style>
      <div className="flex items-center justify-between mb-2">
        {label && <span className="text-xs font-bold text-gray-700">{label}</span>}
        <div className="flex items-center gap-1 mr-auto">
          <span className="text-base">{emoji}</span>
          <span className="text-xl font-black" style={{color}}>{value > 0 ? value : '—'}</span>
          <span className="text-xs text-gray-400 mt-1">/10</span>
        </div>
      </div>
      <div className="relative h-5 rounded-full overflow-hidden" style={{
        background:'linear-gradient(to right, hsl(120,100%,40%), hsl(60,100%,45%), hsl(0,100%,45%))',
        boxShadow:'inset 0 2px 4px rgba(0,0,0,0.15)'
      }}>
        <div className="absolute inset-y-0 right-0 bg-gray-200/70 transition-all duration-150 rounded-r-full"
          style={{width:`${100-pct}%`}} />
        <input type="range" min="1" max="10" value={value || 5}
          onChange={e => onChange(Number(e.target.value))}
          className="slider-thumb-a absolute inset-0 w-full h-full bg-transparent cursor-pointer"
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

interface Props {
  entityId: string
  table: TableName
  foreignKey: ForeignKey
}

export function AdminGenericReviews({ entityId, table, foreignKey }: Props) {
  const supabase = createClient()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Review>>({})

  useEffect(() => {
    loadReviews()
    checkAdmin()
  }, [])

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (data?.role === 'admin') setIsAdmin(true)
  }

  async function loadReviews() {
    const selectFields = '*'
    const { data } = await supabase.from(table).select(selectFields).eq(foreignKey, entityId).order('created_at', { ascending: false })
    setReviews((data as any) || [])
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('למחוק ביקורת זו?')) return
    await supabase.from(table).delete().eq('id', id)
    setReviews(prev => prev.filter(r => r.id !== id))
    window.location.reload()
  }

  function startEdit(r: Review) {
    setEditingId(r.id)
    setEditForm({ rating: r.rating, text: r.text, comment: r.comment, reviewer_name: r.reviewer_name, cleanliness: r.cleanliness, service: r.service, location: r.location, facilities: r.facilities })
  }

  async function handleSave(id: string) {
    const updateData: any = { rating: editForm.rating }
    if (table === 'reviews') {
      updateData.text = editForm.text || null
      updateData.reviewer_name = editForm.reviewer_name
      updateData.cleanliness = editForm.cleanliness || null
      updateData.service = editForm.service || null
      updateData.location = editForm.location || null
      updateData.facilities = editForm.facilities || null
    } else {
      updateData.comment = editForm.comment || null
    }
    await supabase.from(table).update(updateData).eq('id', id)
    setReviews(prev => prev.map(r => r.id === id ? { ...r, ...editForm } as Review : r))
    setEditingId(null)
  }

  const getName = (r: Review) => r.reviewer_name || r.profiles?.full_name || 'אורח'
  const getText = (r: Review) => r.text || r.comment || ''

  if (!isAdmin) return null
  if (loading) return <div className="text-sm text-gray-400 py-4">טוען ביקורות...</div>

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
      <h2 className="font-bold text-gray-700 text-lg mb-4">
        ניהול ביקורות <span className="text-sm font-normal text-gray-400">({reviews.length})</span>
      </h2>
      {reviews.length === 0 ? (
        <p className="text-sm text-gray-400">אין ביקורות</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="border border-gray-100 rounded-xl p-4">
              {editingId === r.id ? (
                <div className="space-y-3">
                  {table === 'reviews' && (
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">שם המבקר</label>
                      <input value={editForm.reviewer_name || ''} onChange={e => setEditForm(p => ({...p, reviewer_name: e.target.value}))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-yellow-600" />
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">דירוג כללי</label>
                    <SliderRating value={editForm.rating || 0} onChange={v => setEditForm(p => ({...p, rating: v}))} />
                  </div>
                  {table === 'reviews' && (
                    <div className="grid grid-cols-3 gap-3">
                      {[{key:'cleanliness',label:'ניקיון'},{key:'service',label:'שירות'},{key:'location',label:'מיקום'},{key:'facilities',label:'מתקנים'}].map(cat => (
                        <div key={cat.key}>
                          <label className="text-xs text-gray-500 block mb-1">{cat.label}</label>
                          <SliderRating value={(editForm as any)[cat.key] || 0} onChange={v => setEditForm(p => ({...p, [cat.key]: v}))} label={cat.label} />
                        </div>
                      ))}
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">טקסט</label>
                    <textarea value={(table === 'reviews' ? editForm.text : editForm.comment) || ''}
                      onChange={e => setEditForm(p => table === 'reviews' ? {...p, text: e.target.value} : {...p, comment: e.target.value})}
                      rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-yellow-600 resize-none" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleSave(r.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600">
                      <IconCheck className="w-4 h-4" color="white" />שמור
                    </button>
                    <button onClick={() => setEditingId(null)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600">
                      <IconX className="w-4 h-4" color="#4b5563" />ביטול
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{getName(r)}</p>
                      <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('he-IL')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating value={r.rating} />
                      <button onClick={() => startEdit(r)} className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-600 hover:bg-yellow-50">
                        <IconPencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                        <IconTrash className="w-4 h-4" color="#9ca3af" />
                      </button>
                    </div>
                  </div>
                  {getText(r) && <p className="text-sm text-gray-600">{getText(r)}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
