'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Star, ArrowRight } from 'lucide-react'

const ACTIVITY_TYPES = [
  { key: 'racer', label: 'ריצר' },
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

type ImagePreview = { file: File; url: string; isPrimary: boolean }

function toSlug(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

export default function NewAttractionPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState<ImagePreview[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [slugPreview, setSlugPreview] = useState('')
  const [form, setForm] = useState({
    name: '',
    name_en: '',
    short_description: '',
    description: '',
    region: '',
    city: '',
    address: '',
    price_per_person: '',
    min_age: '0',
    max_age: '99',
    opening_hours: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    video_url: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'name_en') {
      setSlugPreview(toSlug(value))
      setForm(prev => ({ ...prev, name_en: value }))
      return
    }
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const toggleType = (key: string) => {
    setSelectedTypes(prev => prev.includes(key) ? prev.filter(t => t !== key) : [...prev, key])
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const toAdd = Array.from(files).slice(0, 14 - images.length)
    const newImages = toAdd.map((file, idx) => ({
      file, url: URL.createObjectURL(file), isPrimary: images.length === 0 && idx === 0,
    }))
    setImages(prev => [...prev, ...newImages])
    e.target.value = ''
  }

  const removeImage = (idx: number) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== idx)
      if (prev[idx].isPrimary && next.length > 0) next[0].isPrimary = true
      return next
    })
  }

  const setPrimary = (idx: number) => {
    setImages(prev => prev.map((img, i) => ({ ...img, isPrimary: i === idx })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name_en.trim()) { setError('יש להזין שם באנגלית'); return }
    const slug = toSlug(form.name_en)
    if (!slug) { setError('שם באנגלית אינו תקין'); return }
    if (!form.region) { setError('יש לבחור אזור'); return }

    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('יש להתחבר תחילה'); setLoading(false); return }

    const { data: existing } = await supabase.from('attractions').select('id').eq('slug', slug).single()
    if (existing) { setError('שם זה כבר תפוס — נסה שם אחר'); setLoading(false); return }

    const { data: attraction, error: insertError } = await supabase.from('attractions').insert({
      owner_id: user.id,
      name: form.name,
      slug,
      short_description: form.short_description,
      description: form.description,
      region: form.region,
      city: form.city,
      address: form.address,
      price_per_person: parseInt(form.price_per_person) || 0,
      min_age: parseInt(form.min_age) || 0,
      max_age: parseInt(form.max_age) || 99,
      activity_type: selectedTypes,
      opening_hours: form.opening_hours,
      phone: form.phone,
      whatsapp: form.whatsapp,
      email: form.email,
      website: form.website,
      video_url: form.video_url || null,
      status: 'pending',
    }).select().single()

    if (insertError) { setError(insertError.message); setLoading(false); return }

    // העלאת תמונות
    setUploading(true)
    for (let i = 0; i < images.length; i++) {
      const img = images[i]
      const ext = img.file.name.split('.').pop()
      const fileName = `${attraction.id}/${Date.now()}_${i}.${ext}`
      const { error: uploadError } = await supabase.storage.from('attraction-images').upload(fileName, img.file)
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('attraction-images').getPublicUrl(fileName)
        await supabase.from('attraction_images').insert({
          attraction_id: attraction.id, url: urlData.publicUrl, order: i, is_primary: img.isPrimary,
        })
      }
    }
    setUploading(false)
    router.push('/dashboard/owner')
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowRight className="w-5 h-5 text-gray-500" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">הוספת אטרקציה</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* פרטי האטרקציה */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-700 text-lg">פרטי האטרקציה</h2>

            <div className="flex gap-4">
              <div className="w-[40%]">
                <label className="block text-sm font-medium text-gray-700 mb-1">שם האטרקציה *</label>
                <input name="name" value={form.name} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"
                  placeholder="פארק הרפתקאות" />
              </div>
              <div className="w-[60%]">
                <label className="block text-sm font-medium text-gray-700 mb-1">תיאור קצר</label>
                <input name="short_description" value={form.short_description} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"
                  placeholder="משפט שמתאר את האטרקציה" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                שם באנגלית * <span className="text-gray-400 font-normal">(כתובת האתר)</span>
              </label>
              <input name="name_en" value={form.name_en} onChange={handleChange} required
                className="w-full border border-yellow-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600 bg-yellow-50"
                placeholder="park-harapatkaot" dir="ltr" />
              {slugPreview && (
                <p className="text-xs text-gray-500 mt-1.5">
                  כתובת: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-green-700">zimmer.club/attractions/{slugPreview}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תיאור מלא</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600 resize-none"
                placeholder="תאר את האטרקציה בפירוט..." />
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

          {/* פרטי פעילות */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-700 text-lg">פרטי הפעילות</h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מחיר לאדם (₪)</label>
                <input name="price_per_person" type="number" value={form.price_per_person} onChange={handleChange} min="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"
                  placeholder="50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">גיל מינימום</label>
                <input name="min_age" type="number" value={form.min_age} onChange={handleChange} min="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">גיל מקסימום</label>
                <input name="max_age" type="number" value={form.max_age} onChange={handleChange} min="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שעות פעילות</label>
              <input name="opening_hours" value={form.opening_hours} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"
                placeholder="א-ה 09:00-17:00, ו 09:00-14:00" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">סוג פעילות</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {ACTIVITY_TYPES.map(t => (
                  <button key={t.key} type="button" onClick={() => toggleType(t.key)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${selectedTypes.includes(t.key) ? 'bg-yellow-600 text-white border-yellow-600' : 'bg-white text-gray-700 border-gray-200 hover:border-yellow-600'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* אמצעי תקשורת */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-700 text-lg">אמצעי תקשורת</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
                <input name="phone" value={form.phone} onChange={handleChange} dir="ltr"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"
                  placeholder="03-1234567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">וואטסאפ</label>
                <input name="whatsapp" value={form.whatsapp} onChange={handleChange} dir="ltr"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"
                  placeholder="972501234567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} dir="ltr"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"
                  placeholder="info@attraction.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">אתר אינטרנט</label>
                <input name="website" value={form.website} onChange={handleChange} dir="ltr"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"
                  placeholder="https://www.attraction.com" />
              </div>
            </div>
          </div>

          {/* תמונות */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-700 text-lg mb-1">תמונות</h2>
            <p className="text-xs text-gray-400 mb-4">לחץ על כוכב להגדרת תמונה ראשית</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative group aspect-video">
                  <img src={img.url} alt="" className="w-full h-full object-cover rounded-xl" />
                  {img.isPrimary && <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-1"><Star className="w-3 h-3 text-white fill-white" /></div>}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                    <button type="button" onClick={() => setPrimary(idx)} className="p-1.5 bg-yellow-500 rounded-full"><Star className="w-3.5 h-3.5 text-white" /></button>
                    <button type="button" onClick={() => removeImage(idx)} className="p-1.5 bg-red-500 rounded-full"><X className="w-3.5 h-3.5 text-white" /></button>
                  </div>
                </div>
              ))}
              {images.length < 14 && (
                <label className="aspect-video border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-yellow-600 transition-colors">
                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-400">הוסף תמונות</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* וידאו */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-700 text-lg mb-1">וידאו</h2>
            <input name="video_url" value={form.video_url} onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"
              placeholder="https://www.youtube.com/watch?v=..." dir="ltr" />
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="flex gap-3">
            <button type="submit" disabled={loading || uploading}
              className="flex-1 py-3 rounded-xl font-bold text-white text-sm"
              style={{ backgroundColor: '#8B6914' }}>
              {uploading ? 'מעלה תמונות...' : loading ? 'שומר...' : 'הוסף אטרקציה'}
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
