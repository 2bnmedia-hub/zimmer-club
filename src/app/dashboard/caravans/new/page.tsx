'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CARAVAN_TYPES } from '@/lib/constants'

const REGIONS = [
  { value: 'north', label: 'צפון' },
  { value: 'galil_upper', label: 'גליל עליון' },
  { value: 'galil_lower', label: 'גליל תחתון' },
  { value: 'galil_west', label: 'גליל מערבי' },
  { value: 'kinneret', label: 'כנרת' },
  { value: 'hermon', label: 'חרמון' },
  { value: 'golan', label: 'רמת הגולן' },
  { value: 'center', label: 'מרכז' },
  { value: 'jerusalem', label: 'ירושלים' },
  { value: 'dead_sea', label: 'ים המלח' },
  { value: 'negev', label: 'דרום' },
  { value: 'eilat', label: 'אילת' },
]

export default function NewCaravanPage() {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [form, setForm] = useState({
    name: '', short_description: '', description: '',
    caravan_type: 'auto', region: 'north', city: '', address: '',
    price_per_night: '', min_nights: '1', pricing_type: 'per_night',
    can_relocate: false, manufacture_year: '', sleeping_capacity: '',
    max_guests: '2', phone: '', whatsapp: '', email: '',
    instant_book: false,
  })

  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }))

  async function uploadImages(files: FileList) {
    setUploading(true)
    const urls: string[] = []
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('caravan-images').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('caravan-images').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    setImages(p => [...p, ...urls])
    setUploading(false)
  }

  async function handleSubmit() {
    if (!form.name || !form.price_per_night) return alert('נא למלא שם ומחיר')
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const slug = form.name.trim().toLowerCase()
      .replace(/[\s]+/g, '-')
      .replace(/[^a-z0-9\u0590-\u05FF-]/g, '')
      + '-' + Date.now().toString(36)

    const { data, error } = await supabase.from('caravans').insert({
      owner_id: user.id,
      slug,
      name: form.name,
      short_description: form.short_description,
      description: form.description,
      caravan_type: form.caravan_type,
      region: form.region,
      city: form.city,
      address: form.address,
      price_per_night: parseInt(form.price_per_night),
      min_nights: parseInt(form.min_nights),
      pricing_type: form.pricing_type,
      can_relocate: form.can_relocate,
      manufacture_year: form.manufacture_year ? parseInt(form.manufacture_year) : null,
      sleeping_capacity: form.sleeping_capacity ? parseInt(form.sleeping_capacity) : null,
      max_guests: parseInt(form.max_guests),
      phone: form.phone,
      whatsapp: form.whatsapp,
      email: form.email,
      instant_book: form.instant_book,
      status: 'pending',
    }).select().single()

    if (error || !data) { alert('שגיאה בשמירה'); setSaving(false); return }

    if (images.length > 0) {
      await supabase.from('caravan_images').insert(
        images.map((url, i) => ({ caravan_id: data.id, url, is_primary: i === 0, order: i }))
      )
    }

    router.push('/dashboard/owner')
  }

  const inputClass = "w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 bg-white"
  const labelClass = "block text-xs font-bold uppercase tracking-widest mb-1.5"

  return (
    <div className="min-h-screen py-10 px-4" dir="rtl" style={{ background: '#FAF7F2' }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#B8964A', letterSpacing: '0.14em' }}>dashboard</p>
          <h1 className="text-2xl font-bold" style={{ color: '#2D1E0F' }}>הוספת קרוואן חדש</h1>
          <p className="text-sm mt-1" style={{ color: '#9A7C5E' }}>המודעה תועבר לאישור לפני פרסום</p>
        </div>

        <div className="space-y-6">

          {/* Section: פרטים בסיסיים */}
          <div className="rounded-2xl p-6 space-y-4" style={{ background: '#fff', border: '1px solid rgba(139,105,20,0.08)' }}>
            <h2 className="text-xs font-bold uppercase tracking-widest pb-3" style={{ color: '#B8964A', borderBottom: '1px solid rgba(139,105,20,0.08)', letterSpacing: '0.14em' }}>פרטים בסיסיים</h2>

            <div>
              <label className={labelClass} style={{ color: '#8B6914' }}>שם המודעה *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} className={inputClass} placeholder="למשל: אוטו קרוואן משפחתי 6 מקומות" style={{ borderColor: '#e5e7eb' }} />
            </div>

            <div>
              <label className={labelClass} style={{ color: '#8B6914' }}>סוג קרוואן *</label>
              <div className="flex flex-wrap gap-2">
                {CARAVAN_TYPES.map(t => (
                  <button key={t.value} type="button" onClick={() => set('caravan_type', t.value)}
                    className="px-4 py-2 rounded-full text-sm font-medium border transition-all"
                    style={{
                      background: form.caravan_type === t.value ? '#8B6914' : '#fff',
                      color: form.caravan_type === t.value ? '#fff' : '#6b7280',
                      borderColor: form.caravan_type === t.value ? '#8B6914' : '#e5e7eb',
                    }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass} style={{ color: '#8B6914' }}>תיאור קצר</label>
              <textarea value={form.short_description} onChange={e => set('short_description', e.target.value)}
                className={inputClass} rows={2} maxLength={120}
                placeholder="תיאור קצר שיופיע בכרטיס (עד 120 תווים)"
                style={{ borderColor: '#e5e7eb', resize: 'none' }} />
            </div>

            <div>
              <label className={labelClass} style={{ color: '#8B6914' }}>תיאור מורחב</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                className={inputClass} rows={5}
                placeholder="ספר על הקרוואן, הציוד, חוויית הנסיעה..."
                style={{ borderColor: '#e5e7eb', resize: 'none' }} />
            </div>
          </div>

          {/* Section: תמונות */}
          <div className="rounded-2xl p-6 space-y-4" style={{ background: '#fff', border: '1px solid rgba(139,105,20,0.08)' }}>
            <h2 className="text-xs font-bold uppercase tracking-widest pb-3" style={{ color: '#B8964A', borderBottom: '1px solid rgba(139,105,20,0.08)', letterSpacing: '0.14em' }}>תמונות</h2>
            <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl cursor-pointer transition-all"
              style={{ border: '2px dashed rgba(139,105,20,0.25)', background: 'rgba(139,105,20,0.03)' }}>
              <span className="text-2xl mb-1">📸</span>
              <span className="text-sm font-medium" style={{ color: '#8B6914' }}>{uploading ? 'מעלה...' : 'בחר תמונות'}</span>
              <span className="text-xs text-gray-400 mt-0.5">JPG, PNG עד 5MB</span>
              <input type="file" multiple accept="image/*" className="hidden"
                onChange={e => e.target.files && uploadImages(e.target.files)} />
            </label>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {images.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden" style={{ border: i === 0 ? '2px solid #8B6914' : '2px solid #e5e7eb' }}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {i === 0 && <span className="absolute bottom-0 right-0 left-0 text-center text-white text-[10px] font-bold py-0.5" style={{ background: 'rgba(139,105,20,0.8)' }}>ראשית</span>}
                    <button onClick={() => setImages(p => p.filter((_, j) => j !== i))}
                      className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: מיקום */}
          <div className="rounded-2xl p-6 space-y-4" style={{ background: '#fff', border: '1px solid rgba(139,105,20,0.08)' }}>
            <h2 className="text-xs font-bold uppercase tracking-widest pb-3" style={{ color: '#B8964A', borderBottom: '1px solid rgba(139,105,20,0.08)', letterSpacing: '0.14em' }}>מיקום</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={{ color: '#8B6914' }}>אזור *</label>
                <select value={form.region} onChange={e => set('region', e.target.value)} className={inputClass} style={{ borderColor: '#e5e7eb' }}>
                  {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={{ color: '#8B6914' }}>עיר</label>
                <input value={form.city} onChange={e => set('city', e.target.value)} className={inputClass} placeholder="עיר / יישוב" style={{ borderColor: '#e5e7eb' }} />
              </div>
            </div>
            <div>
              <label className={labelClass} style={{ color: '#8B6914' }}>כתובת מדויקת</label>
              <input value={form.address} onChange={e => set('address', e.target.value)} className={inputClass} placeholder="רחוב, מספר..." style={{ borderColor: '#e5e7eb' }} />
            </div>
          </div>

          {/* Section: תמחור */}
          <div className="rounded-2xl p-6 space-y-4" style={{ background: '#fff', border: '1px solid rgba(139,105,20,0.08)' }}>
            <h2 className="text-xs font-bold uppercase tracking-widest pb-3" style={{ color: '#B8964A', borderBottom: '1px solid rgba(139,105,20,0.08)', letterSpacing: '0.14em' }}>תמחור</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={{ color: '#8B6914' }}>מחיר ללילה (₪) *</label>
                <input type="number" value={form.price_per_night} onChange={e => set('price_per_night', e.target.value)} className={inputClass} placeholder="0" style={{ borderColor: '#e5e7eb' }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: '#8B6914' }}>מינימום לילות</label>
                <select value={form.min_nights} onChange={e => set('min_nights', e.target.value)} className={inputClass} style={{ borderColor: '#e5e7eb' }}>
                  {[1,2,3,4,7,30].map(n => <option key={n} value={n}>{n === 1 ? 'לילה אחד' : n === 7 ? 'שבוע' : n === 30 ? 'חודש' : `${n} לילות`}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {[
                { key: 'instant_book', label: '⚡ הזמנה מיידית' },
                { key: 'can_relocate', label: '🚐 כולל הצבה' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all"
                    style={{ background: form[key as keyof typeof form] ? '#8B6914' : '#fff', borderColor: form[key as keyof typeof form] ? '#8B6914' : '#d1d5db' }}>
                    {form[key as keyof typeof form] && <span className="text-white text-xs">✓</span>}
                  </div>
                  <input type="checkbox" className="sr-only" checked={!!form[key as keyof typeof form]}
                    onChange={e => set(key, e.target.checked)} />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section: מפרט */}
          <div className="rounded-2xl p-6 space-y-4" style={{ background: '#fff', border: '1px solid rgba(139,105,20,0.08)' }}>
            <h2 className="text-xs font-bold uppercase tracking-widest pb-3" style={{ color: '#B8964A', borderBottom: '1px solid rgba(139,105,20,0.08)', letterSpacing: '0.14em' }}>מפרט הקרוואן</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass} style={{ color: '#8B6914' }}>מספר מיטות</label>
                <input type="number" value={form.sleeping_capacity} onChange={e => set('sleeping_capacity', e.target.value)} className={inputClass} placeholder="0" style={{ borderColor: '#e5e7eb' }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: '#8B6914' }}>מקס׳ אורחים</label>
                <input type="number" value={form.max_guests} onChange={e => set('max_guests', e.target.value)} className={inputClass} placeholder="2" style={{ borderColor: '#e5e7eb' }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: '#8B6914' }}>שנת ייצור</label>
                <input type="number" value={form.manufacture_year} onChange={e => set('manufacture_year', e.target.value)} className={inputClass} placeholder="2020" style={{ borderColor: '#e5e7eb' }} />
              </div>
            </div>
          </div>

          {/* Section: יצירת קשר */}
          <div className="rounded-2xl p-6 space-y-4" style={{ background: '#fff', border: '1px solid rgba(139,105,20,0.08)' }}>
            <h2 className="text-xs font-bold uppercase tracking-widest pb-3" style={{ color: '#B8964A', borderBottom: '1px solid rgba(139,105,20,0.08)', letterSpacing: '0.14em' }}>יצירת קשר</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass} style={{ color: '#8B6914' }}>טלפון</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} className={inputClass} placeholder="050-0000000" style={{ borderColor: '#e5e7eb' }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: '#8B6914' }}>וואטסאפ</label>
                <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} className={inputClass} placeholder="050-0000000" style={{ borderColor: '#e5e7eb' }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: '#8B6914' }}>מייל</label>
                <input value={form.email} onChange={e => set('email', e.target.value)} className={inputClass} placeholder="email@example.com" style={{ borderColor: '#e5e7eb' }} />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pb-8">
            <button onClick={handleSubmit} disabled={saving}
              className="flex-1 py-3.5 rounded-xl font-bold text-white transition-all hover:scale-105 text-sm"
              style={{ background: saving ? '#c4a87a' : '#8B6914' }}>
              {saving ? 'שומר...' : 'שלח לאישור ופרסום'}
            </button>
            <button onClick={() => router.back()}
              className="px-6 py-3.5 rounded-xl font-medium text-sm transition-all"
              style={{ background: 'rgba(139,105,20,0.06)', color: '#8B6914', border: '1px solid rgba(139,105,20,0.15)' }}>
              ביטול
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
