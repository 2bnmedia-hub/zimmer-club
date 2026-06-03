'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { REGIONS } from '@/lib/constants'
import { ArrowRight, Upload, X, Star, ChevronLeft, ChevronRight } from 'lucide-react'

const PROPERTY_TYPES = [
  { value: 'zimmer', label: 'צימר' },
  { value: 'villa', label: 'וילה' },
  { value: 'hotel', label: 'מלון' },
  { value: 'camping', label: 'קמפינג' },
]

const AMENITIES_LIST = [
  { key: 'pool', label: 'בריכה' },
  { key: 'jacuzzi', label: "ג'קוזי" },
  { key: 'wifi', label: 'WiFi' },
  { key: 'parking', label: 'חניה' },
  { key: 'bbq', label: 'ברביקיו' },
  { key: 'ac', label: 'מיזוג' },
  { key: 'kitchen', label: 'מטבח' },
  { key: 'fireplace', label: 'קמין' },
  { key: 'garden', label: 'גינה' },
  { key: 'sea_view', label: 'נוף לים' },
  { key: 'mountain_view', label: 'נוף להרים' },
  { key: 'sauna', label: 'סאונה' },
  { key: 'gym', label: 'חדר כושר' },
  { key: 'baby_cot', label: 'עריסה לתינוק' },
  { key: 'wheelchair', label: 'נגיש לנכים' },
  { key: 'shelter', label: 'מרחב מוגן' },
  { key: 'heated_pool', label: 'בריכה מחוממת' },
  { key: 'pets', label: 'ידידותי לכלבים' },
]

type PropertyImage = {
  id: string
  url: string
  is_primary: boolean
  order: number
}

type DateStatus = 'blocked' | 'approved'

type BlockedDate = {
  id: string
  date: string
  status: DateStatus
}

const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
]

const HEBREW_DAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']

function Calendar({
  propertyId,
  supabase,
}: {
  propertyId: string
  supabase: ReturnType<typeof createClient>
}) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [dateMap, setDateMap] = useState<Record<string, DateStatus>>({})
  const [loadingDates, setLoadingDates] = useState(true)

  useEffect(() => {
    async function loadDates() {
      setLoadingDates(true)
      const { data } = await supabase
        .from('blocked_dates')
        .select('id, date, status')
        .eq('property_id', propertyId)
      if (data) {
        const map: Record<string, DateStatus> = {}
        data.forEach((d: BlockedDate) => { map[d.date] = d.status })
        setDateMap(map)
      }
      setLoadingDates(false)
    }
    loadDates()
  }, [propertyId])

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay()

  const formatDate = (day: number) => {
    const m = String(currentMonth + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${currentYear}-${m}-${d}`
  }

  const handleDayClick = async (day: number) => {
    const dateStr = formatDate(day)
    const current = dateMap[dateStr]

    // מחזור: פנוי → תפוס → מאושר → פנוי
    if (!current) {
      // פנוי → תפוס
      const { error } = await supabase.from('blocked_dates').upsert({
        property_id: propertyId,
        date: dateStr,
        status: 'blocked',
      }, { onConflict: 'property_id,date' })
      if (!error) setDateMap(prev => ({ ...prev, [dateStr]: 'blocked' }))
    } else if (current === 'blocked') {
      // תפוס → מאושר
      const { error } = await supabase.from('blocked_dates').upsert({
        property_id: propertyId,
        date: dateStr,
        status: 'approved',
      }, { onConflict: 'property_id,date' })
      if (!error) setDateMap(prev => ({ ...prev, [dateStr]: 'approved' }))
    } else {
      // מאושר → פנוי (מחק)
      const { error } = await supabase.from('blocked_dates').delete()
        .eq('property_id', propertyId).eq('date', dateStr)
      if (!error) {
        setDateMap(prev => {
          const next = { ...prev }
          delete next[dateStr]
          return next
        })
      }
    }
  }

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const daysInMonth = getDaysInMonth(currentMonth, currentYear)
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
  const blanks = Array(firstDay).fill(null)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const getDayStyle = (day: number) => {
    const dateStr = formatDate(day)
    const status = dateMap[dateStr]
    const isPast = new Date(dateStr) < new Date(today.toDateString())
    if (isPast) return 'bg-gray-50 text-gray-300 cursor-not-allowed'
    if (status === 'blocked') return 'bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer font-medium'
    if (status === 'approved') return 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer font-medium'
    return 'hover:bg-yellow-50 hover:text-yellow-700 cursor-pointer text-gray-700'
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="font-bold text-gray-700 text-lg mb-1">ניהול זמינות</h2>
      <p className="text-xs text-gray-400 mb-4">לחץ על יום לשינוי סטטוס: פנוי ← תפוס ← מאושר ← פנוי</p>

      {/* מקרא */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-white border border-gray-200" />
          <span className="text-xs text-gray-500">פנוי</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <span className="text-xs text-gray-500">תפוס</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="text-xs text-gray-500">הזמנה מאושרת</span>
        </div>
      </div>

      {/* ניווט חודש */}
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100">
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
        <span className="font-bold text-gray-800 text-sm">
          {HEBREW_MONTHS[currentMonth]} {currentYear}
        </span>
        <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100">
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {loadingDates ? (
        <div className="text-center py-8 text-gray-400 text-sm">טוען תאריכים...</div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {/* כותרות ימים */}
          {HEBREW_DAYS.map(d => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
          ))}
          {/* ריקים */}
          {blanks.map((_, i) => <div key={`blank-${i}`} />)}
          {/* ימים */}
          {days.map(day => {
            const isPast = new Date(formatDate(day)) < new Date(today.toDateString())
            return (
              <button
                key={day}
                type="button"
                disabled={isPast}
                onClick={() => handleDayClick(day)}
                className={`aspect-square rounded-lg text-xs flex items-center justify-center transition-colors ${getDayStyle(day)}`}
              >
                {day}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function EditPropertyPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [images, setImages] = useState<PropertyImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    short_description: '',
    description: '',
    category: 'zimmer',
    region: '',
    city: '',
    address: '',
    price_per_night: '',
    min_nights: '1',
    max_guests: '2',
    bedrooms: '1',
    bathrooms: '1',
    instant_book: false,
    status: 'pending',
    video_url: '',
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      setIsAdmin(profile?.role === 'admin')
      const { data: property } = await supabase.from('properties').select('*').eq('id', params.id).single()
      if (!property) { router.push('/dashboard/owner'); return }
      if (profile?.role !== 'admin' && property.owner_id !== user.id) { router.push('/dashboard/owner'); return }
      setForm({
        name: property.name || '',
        short_description: property.short_description || '',
        description: property.description || '',
        category: property.category?.[0] || 'zimmer',
        region: property.region || '',
        city: property.city || '',
        address: property.address || '',
        price_per_night: property.price_per_night?.toString() || '',
        min_nights: property.min_nights?.toString() || '1',
        max_guests: property.max_guests?.toString() || '2',
        bedrooms: property.bedrooms?.toString() || '1',
        bathrooms: property.bathrooms?.toString() || '1',
        instant_book: property.instant_book || false,
        video_url: property.video_url || '',
        status: property.status || 'pending',
      })
      const { data: imgData } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', params.id)
        .order('order')
      setImages(imgData || [])

      const { data: amenityData } = await supabase
        .from('property_amenities')
        .select('amenity_id, amenities(key)')
        .eq('property_id', params.id)
      setSelectedAmenities(amenityData?.map((a: any) => a.amenities?.key).filter(Boolean) || [])

      setLoading(false)
    }
    load()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }))
  }

  const toggleAmenity = (key: string) => {
    setSelectedAmenities(prev => prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key])
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const fileName = `${params.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('property-images').upload(fileName, file)
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(fileName)
        const isPrimary = images.length === 0
        const { data: newImg } = await supabase.from('property_images').insert({
          property_id: params.id,
          url: urlData.publicUrl,
          'order': images.length,
          is_primary: isPrimary,
        }).select().single()
        if (newImg) setImages(prev => [...prev, newImg])
      }
    }
    setUploading(false)
    e.target.value = ''
  }

  const handleDeleteImage = async (id: string) => {
    await supabase.from('property_images').delete().eq('id', id)
    setImages(prev => prev.filter(i => i.id !== id))
  }

  const handleSetPrimary = async (id: string) => {
    await supabase.from('property_images').update({ is_primary: false }).eq('property_id', params.id)
    await supabase.from('property_images').update({ is_primary: true }).eq('id', id)
    setImages(prev => prev.map(i => ({ ...i, is_primary: i.id === id })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error: updateError } = await supabase.from('properties').update({
      name: form.name,
      short_description: form.short_description,
      description: form.description,
      category: [form.category],
      region: form.region,
      city: form.city,
      address: form.address,
      price_per_night: parseInt(form.price_per_night),
      min_nights: parseInt(form.min_nights),
      max_guests: parseInt(form.max_guests),
      bedrooms: parseInt(form.bedrooms),
      bathrooms: parseInt(form.bathrooms),
      instant_book: form.instant_book,
      ...(isAdmin && { status: form.status }),
      video_url: form.video_url || null,
      updated_at: new Date().toISOString(),
    }).eq('id', params.id)
    if (updateError) {
      setError(updateError.message)
    } else {
      // שמירת amenities
      const propertyId = String(params.id)
      await supabase.from('property_amenities').delete().eq('property_id', propertyId)
      if (selectedAmenities.length > 0) {
        const { data: allAmenities, error: amenErr } = await supabase.from('amenities').select('id, key')
        console.log('allAmenities:', allAmenities, 'err:', amenErr)
        const amenityRows = (allAmenities || [])
          .filter((a: any) => selectedAmenities.includes(a.key))
          .map((a: any) => ({ property_id: propertyId, amenity_id: a.id }))
        console.log('amenityRows:', amenityRows)
        if (amenityRows.length > 0) {
          const { error: insErr } = await supabase.from('property_amenities').insert(amenityRows)
          console.log('insert error:', insErr)
        }
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">טוען...</div></div>

  return (
    <div className="min-h-screen bg-gray-50 pt-24" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowRight className="w-5 h-5 text-gray-500" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">עריכת נכס</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* לוח שנה זמינות */}
          <Calendar propertyId={params.id as string} supabase={supabase} />

          {/* גלריית תמונות */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-700 text-lg mb-2">גלריית תמונות</h2>
            <p className="text-xs text-gray-400 mb-4">לחץ על כוכב להגדרת תמונה ראשית. לחץ X למחיקה.</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {images.map((img) => (
                <div key={img.id} className="relative group aspect-video">
                  <img src={img.url} alt="" className="w-full h-full object-cover rounded-xl" />
                  {img.is_primary && (
                    <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-1">
                      <Star className="w-3 h-3 text-white fill-white" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                    <button type="button" onClick={() => handleSetPrimary(img.id)}
                      className="p-1.5 bg-yellow-500 rounded-full" title="הגדר כראשית">
                      <Star className="w-3.5 h-3.5 text-white" />
                    </button>
                    <button type="button" onClick={() => handleDeleteImage(img.id)}
                      className="p-1.5 bg-red-500 rounded-full" title="מחק">
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              ))}
              <label className="aspect-video border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-yellow-600 transition-colors">
                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-400">{uploading ? 'מעלה...' : 'הוסף תמונות'}</span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
            <p className="text-xs text-gray-400">{images.length} תמונות · התמונה הראשית מסומנת בכוכב זהב</p>
          </div>

          {/* פרטי הנכס */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-700 text-lg">פרטי הנכס</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שם הנכס *</label>
              <input name="name" value={form.name} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תיאור קצר</label>
              <input name="short_description" value={form.short_description} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תיאור מלא</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">סוג נכס</label>
                <select name="category" value={form.category} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600">
                  {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">איזור</label>
                <select name="region" value={form.region} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600">
                  <option value="">בחר איזור</option>
                  {Object.entries(REGIONS).map(([key, r]) => <option key={key} value={key}>{r.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">עיר/יישוב</label>
                <input name="city" value={form.city} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">כתובת</label>
                <input name="address" value={form.address} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
              </div>
            </div>
          </div>

          {/* תמחור */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-700 text-lg">תמחור וקיבולת</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מחיר ללילה (₪)</label>
                <input name="price_per_night" type="number" value={form.price_per_night} onChange={handleChange} min="1" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מינימום לילות</label>
                <input name="min_nights" type="number" value={form.min_nights} onChange={handleChange} min="1" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מקסימום אורחים</label>
                <input name="max_guests" type="number" value={form.max_guests} onChange={handleChange} min="1" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">חדרי שינה</label>
                <input name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} min="0" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">חדרי רחצה</label>
                <input name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} min="0" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="instant_book" id="instant_book" checked={form.instant_book} onChange={handleChange} className="w-4 h-4 accent-yellow-600" />
              <label htmlFor="instant_book" className="text-sm font-medium text-gray-700">הזמנה מיידית</label>
            </div>
          </div>

          {isAdmin && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-700 text-lg mb-4">סטטוס (אדמין בלבד)</h2>
              <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600">
                <option value="pending">ממתין לאישור</option>
                <option value="active">פעיל</option>
                <option value="inactive">לא פעיל</option>
                <option value="rejected">נדחה</option>
              </select>
            </div>
          )}

          {/* וידאו */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-700 text-lg mb-1">וידאו הנכס</h2>
            <p className="text-xs text-gray-400 mb-3">הדבק קישור YouTube או Vimeo</p>
            <input name="video_url" value={form.video_url} onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"
              placeholder="https://www.youtube.com/watch?v=..." dir="ltr" />
          </div>

          {/* מאפיינים */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-700 text-lg mb-4">מאפיינים ושירותים</h2>
            <div className="grid grid-cols-3 gap-3">
              {AMENITIES_LIST.map((amenity) => (
                <button key={amenity.key} type="button" onClick={() => toggleAmenity(amenity.key)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${selectedAmenities.includes(amenity.key) ? 'bg-yellow-600 text-white border-yellow-600' : 'bg-white text-gray-700 border-gray-200 hover:border-yellow-600'}`}>
                  {amenity.label}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">הנכס עודכן בהצלחה!</div>}

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl font-bold text-white text-sm" style={{ backgroundColor: '#8B6914' }}>
              {saving ? 'שומר...' : 'שמור שינויים'}
            </button>
            <button type="button" onClick={async () => { if(confirm("למחוק את הנכס לצמיתות?")) { await supabase.from("properties").delete().eq("id", params.id); router.push("/dashboard/owner") } }} className="px-6 py-3 rounded-xl font-bold text-red-600 text-sm border border-red-200 hover:bg-red-50">
              מחק נכס
            </button>
            <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-xl font-bold text-gray-700 text-sm border border-gray-200 hover:bg-gray-50">
              ביטול
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
