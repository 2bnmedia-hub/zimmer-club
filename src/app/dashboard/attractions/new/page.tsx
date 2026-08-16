'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { IconSearch, IconMapPin, IconCalendar, IconUsers, IconHome, IconChevronDown, IconChevronUp, IconChevronLeft, IconChevronRight, IconStar, IconHeart, IconUser, IconPhone, IconGlobe, IconNavigation, IconArrowRight, IconZap, IconEye, IconEyeOff, IconUpload, IconTrash, IconEdit, IconPlus, IconCheck, IconMail, IconSend, IconRefresh, IconSparkles, IconBed, IconBath, IconTrendingUp, IconLoader, IconCamera, IconSave, IconAlertCircle, IconCheckCircle, IconClock, IconSliders, IconPencil, IconQr, IconShare, IconDownload, IconZoomIn, IconZoomOut, IconLogOut, IconSettings, IconMenu, IconX } from '@/components/icons'

const ACTIVITY_TYPES = [
  { key: 'rayzi', label: 'רייזרים' },
  { key: 'climbing', label: 'קיר טיפוס' },
  { key: 'ezy_rider', label: 'איזי ריידר' },
  { key: 'laser_tag', label: 'לייזר טאג' },
  { key: 'horses', label: 'רכיבה על סוסים' },
  { key: 'karting', label: 'קארטינג' },
  { key: 'buggy', label: 'באגי' },
  { key: 'club_car', label: 'קלאב קאר' },
  { key: 'water_park', label: 'פארק מים' },

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

type ImagePreview = { file: File; url: string; isPrimary: boolean }

function toSlug(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

const defaultWeeklyHours = (): WeeklyHours =>
  Object.fromEntries(DAYS.map(d => [d.key, { active: false, from: '09:00', to: '17:00' }]))

export default function NewAttractionPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [videos, setVideos] = useState<{id:string,url:string,order:number,storagePath?:string}[]>([])
  const [videoUploading, setVideoUploading] = useState(false)
  const [newAttractionId, setNewAttractionId] = useState<string|null>(null)

  const [error, setError] = useState('')
  const [images, setImages] = useState<ImagePreview[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [customActivity, setCustomActivity] = useState('')
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHours>(defaultWeeklyHours())
  const [slugPreview, setSlugPreview] = useState('')
  const addressInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const initAutocomplete = () => {
      if (!addressInputRef.current || !window.google?.maps?.places) return
      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        componentRestrictions: { country: 'il' },
        fields: ['address_components', 'geometry', 'formatted_address'],
        types: ['address'],
      })
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (!place.address_components) return
        let street = '', streetNumber = '', city = ''
        for (const comp of place.address_components) {
          if (comp.types.includes('route')) street = comp.long_name
          if (comp.types.includes('street_number')) streetNumber = comp.long_name
          if (comp.types.includes('locality')) city = comp.long_name
          if (!city && comp.types.includes('sublocality')) city = comp.long_name
        }
        const address = [street, streetNumber].filter(Boolean).join(' ')
        setForm(prev => ({ ...prev, address, city }))
      })
    }

    if (window.google?.maps?.places) {
      initAutocomplete()
      return
    }

    if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places&language=he`
      script.async = true
      script.onload = initAutocomplete
      document.head.appendChild(script)
    } else {
      const interval = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(interval)
          initAutocomplete()
        }
      }, 100)
      return () => clearInterval(interval)
    }
  }, [])
  const [form, setForm] = useState({
    name: '',
    name_en: '',
    short_description: '',
    description: '',
    region: '',
    city: '',
    address: '',
    price_per_person: '',
    min_age: '',
    max_age: '',
    notes: '',
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

  const updateDay = (day: string, field: keyof DayHours, value: any) => {
    setWeeklyHours(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }))
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

  const allTypes = [
    ...selectedTypes.filter(t => !customActivity || t !== customActivity),
    ...(customActivity.trim() ? [customActivity.trim()] : []),
  ]


  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    if (videos.length + files.length > 10) { alert('מקסימום 10 סרטונים'); return }
    setVideoUploading(true)
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const fileName = `attraction-images/${String(newAttractionId || Date.now())}/video_${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('attraction-images').upload(fileName, file)
      if (!error) {
        const { data } = supabase.storage.from('attraction-images').getPublicUrl(fileName)
        setVideos(prev => [...prev, { id: `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`, url: data.publicUrl, order: prev.length, storagePath: fileName }])
      } else {
        alert(`העלאת הסרטון "${file.name}" נכשלה, נסו שוב`)
      }
    }
    setVideoUploading(false)
    e.target.value = ''
  }

  const handleVideoDelete = (id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id))
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
      min_age: form.min_age ? parseInt(form.min_age) : null,
      max_age: form.max_age ? parseInt(form.max_age) : null,
      activity_type: allTypes,
      opening_hours: JSON.stringify(weeklyHours),
      notes: form.notes,
      phone: form.phone,
      whatsapp: form.whatsapp,
      email: form.email,
      website: form.website,
      video_url: form.video_url || null,
      status: 'pending',
    }).select().single()

    if (insertError) { setError(insertError.message); setLoading(false); return }
    setNewAttractionId(attraction.id)

    setUploading(true)
    let failedImageCount = 0
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
      } else {
        failedImageCount++
      }
    }
    if (failedImageCount > 0) alert(`${failedImageCount} תמונות לא הועלו בהצלחה. אפשר לנסות להוסיף אותן שוב מדף העריכה.`)

    for (let i = 0; i < videos.length; i++) {
      const v = videos[i]
      const { data: newVid } = await supabase.from('attraction_videos').insert({ attraction_id: attraction.id, url: v.url, order: i }).select().single()
      if (newVid && v.storagePath) {
        try {
          await fetch('/api/transcode-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table: 'attraction_videos', id: newVid.id, url: v.url, bucket: 'attraction-images', storagePath: v.storagePath }),
          })
        } catch {
          // transcode failed — original video stays; not fatal
        }
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
            <IconArrowRight className="w-5 h-5 text-gray-500" />
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
                  כתובת: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-green-700">zimmer.club/{slugPreview}</span>
                </p>
              )}
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">כתובת *</label>
                <input ref={addressInputRef} name="address" value={form.address} onChange={handleChange} required
                  placeholder="התחל להקליד כתובת..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
                <p className="text-xs text-gray-400 mt-1">בחר מהרשימה — העיר והכתובת יתמלאו אוטומטית</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">עיר/יישוב *</label>
                <input name="city" value={form.city} onChange={handleChange} required readOnly
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600 bg-gray-50" />
              </div>
            </div>
          </div>

          {/* פרטי פעילות */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-700 text-lg">פרטי הפעילות</h2>

            {/* מחיר */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מחיר לאדם (₪)</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 whitespace-nowrap">החל מ:</span>
                <input name="price_per_person" type="number" value={form.price_per_person} onChange={handleChange} min="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"
                  placeholder="50" />
                <span className="text-sm text-gray-400 whitespace-nowrap">₪</span>
              </div>
            </div>

            {/* גיל */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">גיל מינימום <span className="text-gray-400 font-normal">(אופציונלי)</span></label>
                <input name="min_age" type="number" value={form.min_age} onChange={handleChange} min="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"
                  placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">גיל מקסימום <span className="text-gray-400 font-normal">(אופציונלי)</span></label>
                <input name="max_age" type="number" value={form.max_age} onChange={handleChange} min="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"
                  placeholder="99" />
              </div>
            </div>

            {/* שעות פעילות */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">שעות פעילות</label>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="grid grid-cols-4 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500">
                  <span>יום</span>
                  <span>פעיל</span>
                  <span>פתיחה</span>
                  <span>סגירה</span>
                </div>
                {DAYS.map(day => (
                  <div key={day.key} className={`grid grid-cols-4 items-center px-4 py-3 border-t border-gray-100 ${!weeklyHours[day.key].active ? 'opacity-50' : ''}`}>
                    <span className="text-sm font-medium text-gray-700">{day.label}</span>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" className="sr-only"
                          checked={weeklyHours[day.key].active}
                          onChange={e => updateDay(day.key, 'active', e.target.checked)} />
                        <div className={`w-9 h-5 rounded-full transition-colors ${weeklyHours[day.key].active ? 'bg-yellow-600' : 'bg-gray-200'}`} />
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${weeklyHours[day.key].active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </div>
                    </label>
                    <select value={weeklyHours[day.key].from} disabled={!weeklyHours[day.key].active}
                      onChange={e => updateDay(day.key, 'from', e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-yellow-600 disabled:bg-gray-50">
                      {HOURS_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select value={weeklyHours[day.key].to} disabled={!weeklyHours[day.key].active}
                      onChange={e => updateDay(day.key, 'to', e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-yellow-600 disabled:bg-gray-50">
                      {HOURS_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* סוג פעילות */}
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
                <label className="block text-xs text-gray-500 mb-1">פעילות שלא ברשימה? הוסף כאן:</label>
                <input value={customActivity} onChange={e => setCustomActivity(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"
                  placeholder="שם הפעילות..." />
              </div>
            </div>
          </div>

          {/* הגבלות והערות */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-700 text-lg">הגבלות והערות חשובות</h2>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600 resize-none"
              placeholder="לדוגמה: אסור לבעלי בעיות לב, יש להגיע עם נעלי ספורט, מינימום 10 משתתפים..." />
          </div>

          {/* אמצעי תקשורת */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-700 text-lg">אמצעי תקשורת</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">טלפון <span className="text-red-500">*</span></label>
                <input name="phone" value={form.phone} onChange={handleChange} dir="ltr" required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"
                  placeholder="03-1234567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">וואטסאפ <span className="text-red-500">*</span></label>
                <input name="whatsapp" value={form.whatsapp} onChange={handleChange} dir="ltr" required
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
                  {img.isPrimary && <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-1"><IconStar className="w-3 h-3 text-white fill-white" /></div>}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                    <button type="button" onClick={() => setPrimary(idx)} className="p-1.5 bg-yellow-500 rounded-full"><IconStar className="w-3.5 h-3.5 text-white" /></button>
                    <button type="button" onClick={() => removeImage(idx)} className="p-1.5 bg-red-500 rounded-full"><IconX className="w-3.5 h-3.5 text-white" /></button>
                  </div>
                </div>
              ))}
              {images.length < 14 && (
                <label className="aspect-video border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-yellow-600 transition-colors">
                  <IconUpload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-400">הוסף תמונות</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* סרטונים */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-700 text-lg mb-1">סרטונים</h2>
            <p className="text-xs text-gray-400 mb-4">עד 10 סרטונים (MP4, MOV)</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {videos.map(v => (
                <div key={v.id} className="relative group rounded-xl overflow-hidden bg-black aspect-video">
                  <video src={v.url} controls className="w-full h-full object-cover" />
                  <button type="button" onClick={() => handleVideoDelete(v.id)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconX className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ))}
              {videos.length < 10 && (
                <label className="aspect-video border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-yellow-600 transition-colors">
                  <span className="text-2xl mb-1">🎬</span>
                  <span className="text-xs text-gray-400">{videoUploading ? 'מעלה...' : 'הוסף סרטון'}</span>
                  <input type="file" accept="video/*" multiple onChange={handleVideoUpload} className="hidden" disabled={videoUploading} />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-400">{videos.length}/10 סרטונים</p>
            <div className="flex items-center gap-2 mt-4">
              <div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400">או הדבק קישור</span><div className="flex-1 h-px bg-gray-200" />
            </div>
            <input
              className="w-full mt-3 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"
              placeholder="https://www.youtube.com/watch?v=..." dir="ltr"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const url = (e.target as HTMLInputElement).value.trim()
                  if (url && videos.length < 10) {
                    setVideos(prev => [...prev, { id: `url-${Date.now()}`, url, order: prev.length }])
                    ;(e.target as HTMLInputElement).value = ''
                  }
                }
              }}
            />
            <p className="text-xs text-gray-400 mt-1">הקלד קישור ולחץ Enter להוספה</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="flex gap-3">
            <button type="submit" disabled={loading || uploading}
              className="flex-1 py-3 rounded-xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #C8960C, #8B6914)' }}>
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
