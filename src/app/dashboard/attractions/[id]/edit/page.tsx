'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Star, ArrowRight, Loader2 } from 'lucide-react'

const ACTIVITY_TYPES = [
  { key: 'rayzi', label: 'רייזרים' },
  { key: 'climbing', label: 'קיר טיפוס' },
  { key: 'ezy_rider', label: 'איזי ריידר' },
  { key: 'laser_tag', label: 'לייזר טאג' },
  { key: 'horses', label: 'רכיבה על סוסים' },
  { key: 'karting', label: 'קארטינג' },
  { key: 'buggy', label: 'באגי' },
  { key: 'water_park', label: 'פארק מים' },
  { key: 'pool', label: 'בריכה' },
  { key: 'gymboree', label: 'גימבורי' },
  { key: 'playground', label: 'גן שעשועים' },
  { key: 'ceramics', label: 'סדנת קרמיקה' },
  { key: 'cooking', label: 'סדנת בישול' },
  { key: 'archery', label: 'קשתות' },
  { key: 'paintball', label: 'פיינטבול' },
  { key: 'escape_room', label: 'חדר בריחה' },
  { key: 'zipline', label: 'זיפליין' },
  { key: 'hiking', label: 'טיולים' },
  { key: 'nature', label: 'טבע' },
  { key: 'family', label: 'פעילות משפחתית' },
]

const REGIONS = [
  { value: 'north', label: 'צפון' },
  { value: 'galil_west', label: 'גליל המערבי' },
  { value: 'galil_upper', label: 'גליל העליון' },
  { value: 'galil_lower', label: 'גליל התחתון' },
  { value: 'kinneret', label: 'כנרת' },
  { value: 'hermon', label: 'חרמון' },
  { value: 'center', label: 'מרכז' },
  { value: 'jerusalem', label: 'ירושלים' },
  { value: 'dead_sea', label: 'ים המלח' },
  { value: 'negev', label: 'דרום' },
  { value: 'eilat', label: 'אילת' },
  { value: 'golan', label: 'רמת הגולן' },
]

const HOURS_OPTIONS = [
  '06:00','07:00','08:00','09:00','10:00','11:00','12:00',
  '13:00','14:00','15:00','16:00','17:00','18:00','19:00',
  '20:00','21:00','22:00','23:00','24:00',
]

const DAYS = [
  { key: 'sun', label: "א'" },
  { key: 'mon', label: "ב'" },
  { key: 'tue', label: "ג'" },
  { key: 'wed', label: "ד'" },
  { key: 'thu', label: "ה'" },
  { key: 'fri', label: "ו'" },
  { key: 'sat', label: "ש'" },
]

type DayHours = { active: boolean; from: string; to: string }
type WeeklyHours = Record<string, DayHours>
type ExistingImage = { id: string; url: string; is_primary: boolean; order: number }
type NewImagePreview = { file: File; url: string; isPrimary: boolean }

const KNOWN_KEYS = new Set(ACTIVITY_TYPES.map(t => t.key))

const defaultWeeklyHours = (): WeeklyHours =>
  Object.fromEntries(DAYS.map(d => [d.key, { active: false, from: '09:00', to: '17:00' }]))

const parseWeeklyHours = (raw: unknown): WeeklyHours => {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as WeeklyHours
  } catch {}
  return defaultWeeklyHours()
}

export default function EditAttractionPage({ params }: { params: { id: string } }) {
  const { id } = use(params as unknown as Promise<{ id: string }>)
  const router = useRouter()
  const supabase = createClient()

  const [pageLoading, setPageLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([])
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([])
  const [newImages, setNewImages] = useState<NewImagePreview[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [customActivity, setCustomActivity] = useState('')
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHours>(defaultWeeklyHours())
  const [form, setForm] = useState({
    name: '', short_description: '', description: '', region: '', city: '',
    address: '', price_per_person: '', min_age: '', max_age: '',
    notes: '', phone: '', whatsapp: '', email: '', website: '', video_url: '', status: 'pending',
  })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      const isAdmin = profile?.role === 'admin'

      const { data: attraction, error: fetchError } = await supabase
        .from('attractions').select('*').eq('id', id).single()

      if (fetchError || !attraction) { setNotFound(true); setPageLoading(false); return }

      if (!isAdmin && attraction.owner_id !== user.id) { router.push('/dashboard/owner'); return }

      setForm({
        name: attraction.name || '',
        short_description: attraction.short_description || '',
        description: attraction.description || '',
        region: attraction.region || '',
        city: attraction.city || '',
        address: attraction.address || '',
        price_per_person: attraction.price_per_person?.toString() || '',
        min_age: attraction.min_age?.toString() || '',
        max_age: attraction.max_age?.toString() || '',
        notes: attraction.notes || '',
        phone: attraction.phone || '',
        whatsapp: attraction.whatsapp || '',
        email: attraction.email || '',
        website: attraction.website || '',
        video_url: attraction.video_url || '',
        status: attraction.status || 'pending',
      })

      const types: string[] = Array.isArray(attraction.activity_type) ? attraction.activity_type : []
      setSelectedTypes(types.filter(t => KNOWN_KEYS.has(t)))
      setCustomActivity(types.find(t => !KNOWN_KEYS.has(t)) || '')
      setWeeklyHours(parseWeeklyHours(attraction.opening_hours))

      const { data: imgs } = await supabase.from('attraction_images').select('*').eq('attraction_id', id).order('order')
      setExistingImages(imgs || [])
      setPageLoading(false)
    }
    load()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const toggleType = (key: string) => {
    setSelectedTypes(prev => prev.includes(key) ? prev.filter(t => t !== key) : [...prev, key])
  }

  const updateDay = (day: string, field: keyof DayHours, value: boolean | string) => {
    setWeeklyHours(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }))
  }

  const removeExistingImage = (imgId: string) => {
    setRemovedImageIds(prev => [...prev, imgId])
    setExistingImages(prev => {
      const next = prev.filter(img => img.id !== imgId)
      const removedWasPrimary = prev.find(img => img.id === imgId)?.is_primary
      if (removedWasPrimary && next.length > 0) next[0].is_primary = true
      return next
    })
  }

  const setExistingPrimary = (imgId: string) => {
    setExistingImages(prev => prev.map(img => ({ ...img, is_primary: img.id === imgId })))
    setNewImages(prev => prev.map(img => ({ ...img, isPrimary: false })))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const total = existingImages.length + newImages.length
    const toAdd = Array.from(files).slice(0, 14 - total)
    const previews = toAdd.map((file, idx) => ({ file, url: URL.createObjectURL(file), isPrimary: total === 0 && idx === 0 }))
    setNewImages(prev => [...prev, ...previews])
    e.target.value = ''
  }

  const removeNewImage = (idx: number) => {
    setNewImages(prev => {
      const next = prev.filter((_, i) => i !== idx)
      if (prev[idx].isPrimary && next.length > 0) next[0].isPrimary = true
      return next
    })
  }

  const setNewPrimary = (idx: number) => {
    setExistingImages(prev => prev.map(img => ({ ...img, is_primary: false })))
    setNewImages(prev => prev.map((img, i) => ({ ...img, isPrimary: i === idx })))
  }

  const allTypes = [...selectedTypes, ...(customActivity.trim() ? [customActivity.trim()] : [])]
  const totalImages = existingImages.length + newImages.length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.region) { setError('יש לבחור אזור'); return }
    setLoading(true); setError('')

    const { error: updateError } = await supabase.from('attractions').update({
      name: form.name, short_description: form.short_description, description: form.description,
      region: form.region, city: form.city, address: form.address,
      price_per_person: parseInt(form.price_per_person) || 0,
      min_age: form.min_age ? parseInt(form.min_age) : null,
      max_age: form.max_age ? parseInt(form.max_age) : null,
      activity_type: allTypes, opening_hours: JSON.stringify(weeklyHours),
      notes: form.notes, phone: form.phone, whatsapp: form.whatsapp,
      email: form.email, website: form.website, video_url: form.video_url || null,
      status: form.status, updated_at: new Date().toISOString(),
    }).eq('id', id)

    if (updateError) { setError(updateError.message); setLoading(false); return }

    if (removedImageIds.length > 0) await supabase.from('attraction_images').delete().in('id', removedImageIds)
    for (const img of existingImages) await supabase.from('attraction_images').update({ is_primary: img.is_primary }).eq('id', img.id)

    if (newImages.length > 0) {
      setUploading(true)
      for (let i = 0; i < newImages.length; i++) {
        const img = newImages[i]
        const ext = img.file.name.split('.').pop()
        const fileName = `${id}/${Date.now()}_${i}.${ext}`
        const { error: uploadError } = await supabase.storage.from('attraction-images').upload(fileName, img.file)
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('attraction-images').getPublicUrl(fileName)
          await supabase.from('attraction_images').insert({ attraction_id: id, url: urlData.publicUrl, order: existingImages.length + i, is_primary: img.isPrimary })
        }
      }
      setUploading(false)
    }
    router.push('/dashboard/owner')
  }

  if (pageLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <p className="text-gray-600 text-lg">האטרקציה לא נמצאה</p>
      <button onClick={() => router.back()} className="text-yellow-700 underline text-sm">חזור</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowRight className="w-5 h-5 text-gray-500" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">עריכת אטרקציה</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-700 text-lg">פרטי האטרקציה</h2>
            <div className="flex gap-4">
              <div className="w-[40%]">
                <label className="block text-sm font-medium text-gray-700 mb-1">שם האטרקציה *</label>
                <input name="name" value={form.name} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
              </div>
              <div className="w-[60%]">
                <label className="block text-sm font-medium text-gray-700 mb-1">תיאור קצר</label>
                <input name="short_description" value={form.short_description} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"
                  placeholder="משפט שמתאר את האטרקציה" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תיאור מלא</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">אזור *</label>
                <select name="region" value={form.region} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600">
                  <option value="">בחר אזור</option>
                  {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">עיר/יישוב</label>
                <input name="city" value={form.city} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">כתובת מדויקת</label>
              <input name="address" value={form.address} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-700 text-lg">פרטי הפעילות</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מחיר לאדם (₪)</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 whitespace-nowrap">החל מ:</span>
                <input name="price_per_person" type="number" value={form.price_per_person} onChange={handleChange} min="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" placeholder="50" />
                <span className="text-sm text-gray-400 whitespace-nowrap">₪</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">גיל מינימום</label>
                <input name="min_age" type="number" value={form.min_age} onChange={handleChange} min="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">גיל מקסימום</label>
                <input name="max_age" type="number" value={form.max_age} onChange={handleChange} min="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" placeholder="99" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">שעות פעילות</label>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="grid grid-cols-4 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500">
                  <span>יום</span><span>פעיל</span><span>פתיחה</span><span>סגירה</span>
                </div>
                {DAYS.map(day => (
                  <div key={day.key} className={`grid grid-cols-4 items-center px-4 py-3 border-t border-gray-100 ${!weeklyHours[day.key]?.active ? 'opacity-50' : ''}`}>
                    <span className="text-sm font-medium text-gray-700">{day.label}</span>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" className="sr-only" checked={weeklyHours[day.key]?.active ?? false}
                          onChange={e => updateDay(day.key, 'active', e.target.checked)} />
                        <div className={`w-9 h-5 rounded-full transition-colors ${weeklyHours[day.key]?.active ? 'bg-yellow-600' : 'bg-gray-200'}`} />
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${weeklyHours[day.key]?.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </div>
                    </label>
                    <select value={weeklyHours[day.key]?.from ?? '09:00'} disabled={!weeklyHours[day.key]?.active}
                      onChange={e => updateDay(day.key, 'from', e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-yellow-600 disabled:bg-gray-50">
                      {HOURS_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select value={weeklyHours[day.key]?.to ?? '17:00'} disabled={!weeklyHours[day.key]?.active}
                      onChange={e => updateDay(day.key, 'to', e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-yellow-600 disabled:bg-gray-50">
                      {HOURS_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">סוג פעילות</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                {ACTIVITY_TYPES.map(t => (
                  <button key={t.key} type="button" onClick={() => toggleType(t.key)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${selectedTypes.includes(t.key) ? 'bg-yellow-600 text-white border-yellow-600' : 'bg-white text-gray-700 border-gray-200 hover:border-yellow-600'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">פעילות שלא ברשימה?</label>
                <input value={customActivity} onChange={e => setCustomActivity(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"
                  placeholder="שם הפעילות..." />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-700 text-lg">הגבלות והערות חשובות</h2>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600 resize-none"
              placeholder="לדוגמה: אסור לבעלי בעיות לב..." />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-700 text-lg">אמצעי תקשורת</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
                <input name="phone" value={form.phone} onChange={handleChange} dir="ltr"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" placeholder="03-1234567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">וואטסאפ</label>
                <input name="whatsapp" value={form.whatsapp} onChange={handleChange} dir="ltr"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" placeholder="972501234567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} dir="ltr"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" placeholder="info@attraction.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">אתר אינטרנט</label>
                <input name="website" value={form.website} onChange={handleChange} dir="ltr"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" placeholder="https://www.attraction.com" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-700 text-lg mb-3">סטטוס</h2>
            <select name="status" value={form.status} onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600">
              <option value="pending">ממתין לאישור</option>
              <option value="active">פעיל</option>
              <option value="inactive">לא פעיל</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-700 text-lg mb-1">תמונות</h2>
            <p className="text-xs text-gray-400 mb-4">לחץ על כוכב להגדרת תמונה ראשית</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {existingImages.map(img => (
                <div key={img.id} className="relative group aspect-video">
                  <img src={img.url} alt="" className="w-full h-full object-cover rounded-xl" />
                  {img.is_primary && <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-1"><Star className="w-3 h-3 text-white fill-white" /></div>}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                    <button type="button" onClick={() => setExistingPrimary(img.id)} className="p-1.5 bg-yellow-500 rounded-full"><Star className="w-3.5 h-3.5 text-white" /></button>
                    <button type="button" onClick={() => removeExistingImage(img.id)} className="p-1.5 bg-red-500 rounded-full"><X className="w-3.5 h-3.5 text-white" /></button>
                  </div>
                </div>
              ))}
              {newImages.map((img, idx) => (
                <div key={idx} className="relative group aspect-video">
                  <img src={img.url} alt="" className="w-full h-full object-cover rounded-xl" />
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">חדש</div>
                  {img.isPrimary && <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-1"><Star className="w-3 h-3 text-white fill-white" /></div>}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                    <button type="button" onClick={() => setNewPrimary(idx)} className="p-1.5 bg-yellow-500 rounded-full"><Star className="w-3.5 h-3.5 text-white" /></button>
                    <button type="button" onClick={() => removeNewImage(idx)} className="p-1.5 bg-red-500 rounded-full"><X className="w-3.5 h-3.5 text-white" /></button>
                  </div>
                </div>
              ))}
              {totalImages < 14 && (
                <label className="aspect-video border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-yellow-600 transition-colors">
                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-400">הוסף תמונות</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-700 text-lg mb-2">וידאו</h2>
            <input name="video_url" value={form.video_url} onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"
              placeholder="https://www.youtube.com/watch?v=..." dir="ltr" />
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="flex gap-3">
            <button type="submit" disabled={loading || uploading}
              className="flex-1 py-3 rounded-xl font-bold text-white text-sm"
              style={{ backgroundColor: '#8B6914' }}>
              {uploading ? 'מעלה תמונות...' : loading ? 'שומר...' : 'שמור שינויים'}
            </button>
            <button type="button" onClick={() => router.back()}
              className="px-6 py-3 rounded-xl font-bold text-gray-700 text-sm border border-gray-200 hover:bg-gray-50">
              ביטול
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
