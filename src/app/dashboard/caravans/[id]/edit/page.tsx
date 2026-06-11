'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CARAVAN_TYPES } from '@/lib/constants'
import { use } from 'react'

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

const CARAVAN_AMENITIES = [
  { category: 'נוחות ואבזור פנים', icon: '🛋️', items: ['טלוויזיה חכמה דקה','מערכת מולטימדיה מתקדמת','אינטרנט אלחוטי (Wi-Fi)','מזגן','חימום פנימי','וילונות האפלה אטומים','תאורת LED חכמה','שקעי USB ו-Type-C','שקעי 220V','כספת אישית','שולחן אוכל מתקפל','ספה נפתחת למיטה','מיטה זוגית קבועה','מיטות קומותיים','מזרן אורטופדי'] },
  { category: 'מטבח', icon: '🍳', items: ['מיני בר','מקרר','מקפיא','מיקרוגל','כיריים גז','כיריים אינדוקציה','תנור אפייה','קומקום חשמלי','מכונת קפה','טוסטר','בר מים','כיור מטבח','משטח עבודה'] },
  { category: 'חדר רחצה', icon: '🚿', items: ['מקלחת','שירותים כימיים','שירותים עם מיכל הדחה','כיור רחצה','מים חמים 24/7','מראה מוארת','ונטה לאוורור'] },
  { category: 'חשמל ואנרגיה', icon: '⚡', items: ['פאנלים סולאריים','מצברי ליתיום','גנרטור','ממיר מתח','חיבור לחשמל חיצוני','מערכת ניהול אנרגיה חכמה','תאורת חירום'] },
  { category: 'מים ותשתיות', icon: '💧', items: ['מיכל מים נקיים','מיכל מים אפורים','משאבת מים בלחץ גבוה','מערכת סינון מים','חיבור מים חיצוני'] },
  { category: 'חוץ ופנאי', icon: '🌳', items: ['סוכך נפתח','פינת ישיבה חיצונית','שולחן חוץ','כיסאות חוץ','מנגל גז','מטבח חוץ','תאורת חוץ','מקלחת חיצונית','מחסן ציוד חיצוני'] },
  { category: 'בידור ויוקרה', icon: '🎬', items: ['מקרן קולנוע','מסך הקרנה','מערכת סאונד היקפית','רמקולי Bluetooth','קונסולת משחקים','Netflix / YouTube מובנים','תאורת אווירה RGB','גג פנורמי','חלונות נוף גדולים'] },
  { category: 'בטיחות', icon: '🔒', items: ['מצלמות היקפיות','מצלמת רוורס','גלאי עשן','גלאי גז','מטף כיבוי אש','ערכת עזרה ראשונה','מערכת אזעקה','GPS ואיתור רכב'] },
  { category: 'אבזור פרימיום', icon: '💎', items: ['ג\'קוזי חיצוני','מכונת אספרסו מובנית','רצפה מחוממת','שליטה חכמה מהטלפון','מנעול חכם','מערכת בית חכם','טלוויזיה בחדר השינה ובסלון','מטען אלחוטי מובנה','מקרר יין','כורסאות עיסוי'] },
  { category: 'מתאים ל', icon: '👥', items: ['משפחות','זוגות','שומרי שבת','ידידותי לחיות מחמד','נגיש לנכים','עישון מותר','Self Check-in','חניה צמודה','נוף לים','נוף להרים','נוף למדבר','בריכה פרטית','עמדת טעינה לרכב חשמלי'] },
]

export default function EditCaravanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params as unknown as Promise<{ id: string }>)
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState<string[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [form, setForm] = useState({
    name: '', short_description: '', description: '',
    caravan_type: 'auto', region: 'north', city: '', address: '',
    price_per_night: '', min_nights: '1', pricing_type: 'per_night',
    can_relocate: false, manufacture_year: '', sleeping_capacity: '',
    max_guests: '2', phone: '', whatsapp: '', email: '',
    instant_book: false, video_url: '', double_beds: '', single_beds: '', phone2: '',
  })

  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }))
  const toggleAmenity = (item: string) =>
    setSelectedAmenities(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('caravans').select('*, caravan_images(url, is_primary, order)').eq('id', id).single()
      if (!data) { router.push('/dashboard/owner'); return }
      setForm({
        name: data.name || '',
        short_description: data.short_description || '',
        description: data.description || '',
        caravan_type: data.caravan_type || 'auto',
        region: data.region || 'north',
        city: data.city || '',
        address: data.address || '',
        price_per_night: String(data.price_per_night || ''),
        min_nights: String(data.min_nights || '1'),
        pricing_type: data.pricing_type || 'per_night',
        can_relocate: data.can_relocate || false,
        manufacture_year: String(data.manufacture_year || ''),
        sleeping_capacity: String(data.sleeping_capacity || ''),
        max_guests: String(data.max_guests || '2'),
        phone: data.phone || '',
        phone2: data.phone2 || '',
        whatsapp: data.whatsapp || '',
        email: data.email || '',
        instant_book: data.instant_book || false,
        video_url: data.video_url || '',
        double_beds: String(data.double_beds || ''),
        single_beds: String(data.single_beds || ''),
      })
      setSelectedAmenities(data.amenities || [])
      const sorted = (data.caravan_images || []).sort((a: any, b: any) => a.order - b.order)
      setImages(sorted.map((i: any) => i.url))
      setLoading(false)
    }
    load()
  }, [id])

  async function uploadImages(files: FileList) {
    const MAX_SIZE = 5 * 1024 * 1024
    const fileArray = Array.from(files).filter(f => {
      if (f.size > MAX_SIZE) { alert(`הקובץ ${f.name} גדול מ-5MB`); return false }
      return true
    })
    if (fileArray.length === 0) return
    setUploading(true)
    const previews = fileArray.map(f => URL.createObjectURL(f))
    setImages(p => [...p, ...previews])
    const urls: string[] = []
    for (const file of fileArray) {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('caravan-images').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('caravan-images').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    setImages(p => {
      const newImages = [...p]
      const startIdx = newImages.length - previews.length
      urls.forEach((url, i) => { newImages[startIdx + i] = url })
      return newImages
    })
    setUploading(false)
  }

  async function handleSubmit() {
    if (!form.name || !form.price_per_night) return alert('נא למלא שם ומחיר')
    setSaving(true)
    const { error } = await supabase.from('caravans').update({
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
      sleeping_capacity: (parseInt(form.double_beds||'0')*2) + parseInt(form.single_beds||'0') || null,
      double_beds: form.double_beds ? parseInt(form.double_beds) : null,
      single_beds: form.single_beds ? parseInt(form.single_beds) : null,
      max_guests: parseInt(form.max_guests),
      phone: form.phone,
      phone2: form.phone2 || null,
      whatsapp: form.whatsapp,
      email: form.email,
      instant_book: form.instant_book,
      video_url: form.video_url || null,
      amenities: selectedAmenities,
      updated_at: new Date().toISOString(),
    }).eq('id', id)

    if (error) { alert('שגיאה בשמירה'); setSaving(false); return }

    await supabase.from('caravan_images').delete().eq('caravan_id', id)
    if (images.length > 0) {
      await supabase.from('caravan_images').insert(
        images.map((url, i) => ({ caravan_id: id, url, is_primary: i === 0, order: i }))
      )
    }
    router.push('/dashboard/owner')
  }

  const inputClass = "w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 bg-white"
  const labelClass = "block text-xs font-bold uppercase tracking-widest mb-1.5"

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-400">טוען...</div></div>

  return (
    <div className="min-h-screen py-10 px-4" dir="rtl" style={{ background: '#FAF7F2' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#2D1E0F' }}>עריכת קרוואן</h1>
            <p className="text-sm mt-1" style={{ color: '#9A7C5E' }}>{form.name}</p>
          </div>
          <button onClick={() => router.back()} className="text-sm px-4 py-2 rounded-xl" style={{ background: 'rgba(139,105,20,0.06)', color: '#8B6914' }}>← חזרה</button>
        </div>
        <div className="space-y-6">

          <div className="rounded-2xl p-6 space-y-4" style={{ background: '#fff', border: '1px solid rgba(139,105,20,0.08)' }}>
            <div>
              <label className={labelClass} style={{ color: '#8B6914' }}>שם העסק *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} className={inputClass} style={{ borderColor: '#e5e7eb' }} />
            </div>
            <div>
              <label className={labelClass} style={{ color: '#8B6914' }}>סוג קרוואן *</label>
              <div className="flex flex-wrap gap-2">
                {CARAVAN_TYPES.map(t => (
                  <button key={t.value} type="button" onClick={() => set('caravan_type', t.value)}
                    className="px-4 py-2 rounded-full text-sm font-medium border transition-all"
                    style={{ background: form.caravan_type === t.value ? '#8B6914' : '#fff', color: form.caravan_type === t.value ? '#fff' : '#6b7280', borderColor: form.caravan_type === t.value ? '#8B6914' : '#e5e7eb' }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass} style={{ color: '#8B6914' }}>במשפט אחד</label>
              <textarea value={form.short_description} onChange={e => set('short_description', e.target.value)} className={inputClass} rows={1} maxLength={120} style={{ borderColor: '#e5e7eb', resize: 'none' }} />
            </div>
            <div>
              <label className={labelClass} style={{ color: '#8B6914' }}>תיאור מורחב</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} className={inputClass} rows={5} style={{ borderColor: '#e5e7eb', resize: 'none' }} />
            </div>
          </div>

          <div className="rounded-2xl p-6 space-y-4" style={{ background: '#fff', border: '1px solid rgba(139,105,20,0.08)' }}>
            <h2 className="text-xs font-bold uppercase tracking-widest pb-3" style={{ color: '#B8964A', borderBottom: '1px solid rgba(139,105,20,0.08)' }}>תמונות</h2>
            <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl cursor-pointer" style={{ border: '2px dashed rgba(139,105,20,0.25)', background: 'rgba(139,105,20,0.03)' }}>
              <span className="text-2xl mb-1">📸</span>
              <span className="text-sm font-medium" style={{ color: '#8B6914' }}>{uploading ? 'מעלה...' : 'הוסף תמונות'}</span>
              <span className="text-xs text-gray-400 mt-0.5">JPG, PNG — עד 5MB</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={e => e.target.files && uploadImages(e.target.files)} />
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {images.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden" style={{ border: i === 0 ? '2px solid #8B6914' : '2px solid #e5e7eb' }}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {i === 0 && <span className="absolute bottom-0 right-0 left-0 text-center text-white text-[10px] font-bold py-0.5" style={{ background: 'rgba(139,105,20,0.8)' }}>ראשית</span>}
                  <button type="button" onClick={() => setImages(p => p.filter((_, j) => j !== i))} className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">×</button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-6 space-y-4" style={{ background: '#fff', border: '1px solid rgba(139,105,20,0.08)' }}>
            <h2 className="text-xs font-bold uppercase tracking-widest pb-3" style={{ color: '#B8964A', borderBottom: '1px solid rgba(139,105,20,0.08)' }}>וידאו (אופציונלי)</h2>
            <div>
              <label className={labelClass} style={{ color: '#8B6914' }}>קישור YouTube / Vimeo</label>
              <input value={form.video_url || ''} onChange={e => set('video_url', e.target.value)} className={inputClass} placeholder="https://youtube.com/watch?v=..." style={{ borderColor: '#e5e7eb' }} />
            </div>
          </div>

          <div className="rounded-2xl p-6 space-y-4" style={{ background: '#fff', border: '1px solid rgba(139,105,20,0.08)' }}>
            <h2 className="text-xs font-bold uppercase tracking-widest pb-3" style={{ color: '#B8964A', borderBottom: '1px solid rgba(139,105,20,0.08)' }}>מיקום</h2>
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center" style={{ background: form.can_relocate ? '#8B6914' : '#fff', borderColor: form.can_relocate ? '#8B6914' : '#d1d5db' }}>
                {form.can_relocate && <span className="text-white text-xs">✓</span>}
              </div>
              <input type="checkbox" className="sr-only" checked={form.can_relocate} onChange={e => set('can_relocate', e.target.checked)} />
              <span className="text-sm text-gray-700">ניתן להציב בשטח כבקשת הלקוח</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={{ color: '#8B6914' }}>אזור *</label>
                <select value={form.region} onChange={e => set('region', e.target.value)} className={inputClass} style={{ borderColor: '#e5e7eb' }}>
                  {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={{ color: '#8B6914' }}>עיר</label>
                <input value={form.city} onChange={e => set('city', e.target.value)} className={inputClass} style={{ borderColor: '#e5e7eb' }} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 space-y-4" style={{ background: '#fff', border: '1px solid rgba(139,105,20,0.08)' }}>
            <h2 className="text-xs font-bold uppercase tracking-widest pb-3" style={{ color: '#B8964A', borderBottom: '1px solid rgba(139,105,20,0.08)' }}>תמחור</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={{ color: '#8B6914' }}>החל מ: (₪) *</label>
                <input type="number" value={form.price_per_night} onChange={e => set('price_per_night', e.target.value)} className={inputClass} style={{ borderColor: '#e5e7eb' }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: '#8B6914' }}>מינימום לילות</label>
                <select value={form.min_nights} onChange={e => set('min_nights', e.target.value)} className={inputClass} style={{ borderColor: '#e5e7eb' }}>
                  {[1,2,3,4,7,30].map(n => <option key={n} value={n}>{n === 1 ? 'לילה אחד' : n === 7 ? 'שבוע' : n === 30 ? 'חודש' : `${n} לילות`}</option>)}
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center" style={{ background: form.instant_book ? '#8B6914' : '#fff', borderColor: form.instant_book ? '#8B6914' : '#d1d5db' }}>
                {form.instant_book && <span className="text-white text-xs">✓</span>}
              </div>
              <input type="checkbox" className="sr-only" checked={form.instant_book} onChange={e => set('instant_book', e.target.checked)} />
              <span className="text-sm text-gray-700">⚡ הזמנה מיידית</span>
            </label>
          </div>

          <div className="rounded-2xl p-6 space-y-4" style={{ background: '#fff', border: '1px solid rgba(139,105,20,0.08)' }}>
            <h2 className="text-xs font-bold uppercase tracking-widest pb-3" style={{ color: '#B8964A', borderBottom: '1px solid rgba(139,105,20,0.08)' }}>מפרט הקרוואן</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass} style={{ color: '#8B6914' }}>מיטות זוגיות</label>
                <input type="number" value={form.double_beds || ''} onChange={e => set('double_beds', e.target.value)} className={inputClass} placeholder="0" style={{ borderColor: '#e5e7eb' }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: '#8B6914' }}>מיטות בודדות</label>
                <input type="number" value={form.single_beds || ''} onChange={e => set('single_beds', e.target.value)} className={inputClass} placeholder="0" style={{ borderColor: '#e5e7eb' }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: '#8B6914' }}>מקס׳ אורחים</label>
                <input type="number" value={form.max_guests} onChange={e => set('max_guests', e.target.value)} className={inputClass} style={{ borderColor: '#e5e7eb' }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: '#8B6914' }}>שנת ייצור</label>
                <input type="number" value={form.manufacture_year} onChange={e => set('manufacture_year', e.target.value)} className={inputClass} placeholder="2020" style={{ borderColor: '#e5e7eb' }} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 space-y-4" style={{ background: '#fff', border: '1px solid rgba(139,105,20,0.08)' }}>
            <h2 className="text-xs font-bold uppercase tracking-widest pb-3" style={{ color: '#B8964A', borderBottom: '1px solid rgba(139,105,20,0.08)' }}>יצירת קשר</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass} style={{ color: '#8B6914' }}>טלפון 1</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} className={inputClass} placeholder="050-0000000" style={{ borderColor: '#e5e7eb' }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: '#8B6914' }}>טלפון 2</label>
                <input value={form.phone2 || ''} onChange={e => set('phone2', e.target.value)} className={inputClass} placeholder="050-0000000" style={{ borderColor: '#e5e7eb' }} />
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

          <div className="rounded-2xl p-6 space-y-5" style={{ background: '#fff', border: '1px solid rgba(139,105,20,0.08)' }}>
            <h2 className="text-xs font-bold uppercase tracking-widest pb-3" style={{ color: '#B8964A', borderBottom: '1px solid rgba(139,105,20,0.08)' }}>שירותים</h2>
            {CARAVAN_AMENITIES.map(group => (
              <div key={group.category}>
                <p className="text-sm font-bold mb-2 flex items-center gap-1.5" style={{ color: '#3D2B1A' }}>
                  <span>{group.icon}</span> {group.category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.items.map(item => (
                    <button key={item} type="button" onClick={() => toggleAmenity(item)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                      style={{ background: selectedAmenities.includes(item) ? 'rgba(139,105,20,0.10)' : '#fff', color: selectedAmenities.includes(item) ? '#8B6914' : '#6b7280', borderColor: selectedAmenities.includes(item) ? '#8B6914' : '#e5e7eb' }}>
                      {selectedAmenities.includes(item) && <span className="ml-1">✓</span>}
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pb-8">
            <button onClick={handleSubmit} disabled={saving}
              className="flex-1 py-3.5 rounded-xl font-bold text-white transition-all hover:scale-105 text-sm"
              style={{ background: saving ? '#c4a87a' : '#8B6914' }}>
              {saving ? 'שומר...' : 'שמור שינויים'}
            </button>
            <button onClick={() => router.back()}
              className="px-6 py-3.5 rounded-xl font-medium text-sm"
              style={{ background: 'rgba(139,105,20,0.06)', color: '#8B6914', border: '1px solid rgba(139,105,20,0.15)' }}>
              ביטול
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
