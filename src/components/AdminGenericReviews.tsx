'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { IconStar, IconTrash, IconPencil, IconCheck, IconX } from '@/components/icons'

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

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <button key={i} type="button" onClick={() => onChange?.(i)}
          onMouseEnter={() => onChange && setHovered(i)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}>
          <IconStar className={`w-4 h-4 ${i <= (hovered || value) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
        </button>
      ))}
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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Review>>({})

  useEffect(() => { loadReviews() }, [])

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
  }

  function startEdit(r: Review) {
    setEditingId(r.id)
    setEditForm({ rating: r.rating, text: r.text, comment: r.comment, reviewer_name: r.reviewer_name })
  }

  async function handleSave(id: string) {
    const updateData: any = { rating: editForm.rating }
    if (table === 'reviews') updateData.text = editForm.text || null
    else updateData.comment = editForm.comment || null
    if (table === 'reviews') updateData.reviewer_name = editForm.reviewer_name
    await supabase.from(table).update(updateData).eq('id', id)
    setReviews(prev => prev.map(r => r.id === id ? { ...r, ...editForm } as Review : r))
    setEditingId(null)
  }

  const getName = (r: Review) => r.reviewer_name || r.profiles?.full_name || 'אורח'
  const getText = (r: Review) => r.text || r.comment || ''

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
                    <label className="text-xs text-gray-500 block mb-1">דירוג</label>
                    <StarRating value={editForm.rating || 0} onChange={v => setEditForm(p => ({...p, rating: v}))} />
                  </div>
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
