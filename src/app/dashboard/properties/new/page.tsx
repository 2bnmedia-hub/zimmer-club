'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Star } from 'lucide-react'

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
  { key: 'spa', label: 'ספא צמוד' },
  { key: 'private_pool', label: 'בריכה פרטית' },
  { key: 'snooker', label: 'שולחן סנוקר' },
  { key: 'private_jacuzzi', label: "ג'קוזי פרטי" },
  { key: 'accessible', label: 'צימר עם נגישות' },
  { key: 'couples', label: 'מתאים לזוגות' },
  { key: 'families', label: 'מתאים למשפחות' },
  { key: 'groups', label: 'מתאים לקבוצות' },
  { key: 'animals', label: 'מקבלים בעלי חיים' },
  { key: 'guests', label: 'מתאים לאורועים' },
  { key: 'religious', label: 'מתאים לציבור הדתי' },
  { key: 'suite', label: 'סוויטה' },
  { key: 'treehouse', label: 'בקתת עץ' },
  { key: 'cave', label: 'צימר מערה' },
  { key: 'mobile', label: 'צימר מבודד' },
  { key: 'longstay', label: 'צימרים לטווח ארוך' },
  { key: 'vacation', label: 'דירת נופש' },
  { key: 'shelter_nearby', label: 'מרחב מוגן קרוב' },
]

type ImagePreview = {
  file: File
  url: string
  isPrimary: boolean
}

export default function NewPropertyPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [images, setImages] = useState<ImagePreview[]>([])
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
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }))
  }

  const toggleAmenity = (key: string) => {
    setSelectedAmenities(prev => prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key])
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const valid = Array.from(files).filter(f => {
      if (f.size > 2 * 1024 * 1024) {
        alert(`הקובץ "${f.name}" גדול מ-2MB ולא יתווסף`)
        return false
      }
      return true
    })
    const remaining = 14 - images.length
    if (valid.length > remaining) {
      alert(`ניתן להוסיף עד 14 תמונות בלבד. יתווספו ${remaining} תמונות.`)
    }
    const toAdd = valid.slice(0, remaining)
    const newImages = toAdd.map((file, idx) => ({
      file,
      url: URL.createObjectURL(file),
      isPrimary: images.length === 0 && idx === 0,
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

  const uploadImages = async (propertyId: string) => {
    for (let i = 0; i < images.length; i++) {
      const img = images[i]
      const ext = img.file.name.split('.').pop()
      const fileName = `${propertyId}/${Date.now()}_${i}.${ext}`
      const { error: uploadError } = await supabase.storage.from('property-images').upload(fileName, img.file)
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(fileName)
        await supabase.from('property_images').insert({
          property_id: propertyId,
          url: urlData.publicUrl,
          order: i,
          is_primary: img.isPrimary,
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('יש להתחבר תחילה'); setLoading(false); return }
    const { data: property, error: insertError } = await supabase.from('properties').insert({
      owner_id: user.id,
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
      status: 'pending',
    }).select().single()
    if (insertError) { setError(insertError.message); setLoading(false); return }
    if (images.length > 0) {
      setUploading(true)
      await uploadImages(property.id)
      setUploading(false)
    }
    router.push('/dashboard/owner')
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">הוספת נכס חדש</h1>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* פרטי הנכס */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-700 text-lg">פרטי הנכס</h2>
            <div className="flex gap-4">
              <div className="w-[30%]">
                <label className="block text-sm font-medium text-gray-700 mb-1">שם הנכס *</label>
                <input name="name" value={form.name} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"
                  placeholder="צימר הגליל" />
              </div>
              <div className="w-[70%]">
                <label className="block text-sm font-medium text-gray-700 mb-1">תיאור קצר</label>
                <input name="short_description" value={form.short_description} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"
                  placeholder="משפט אחד שמתאר את הנכס" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תיאור מלא</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600 resize-none"
                placeholder="תאר את הנכס בפירוט..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">סוג נכס *</label>
                <select name="category" value={form.category} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600">
                  {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">איזור *</label>
                <select name="region" value={form.region} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600">
                  <option value="">בחר איזור</option>
                  <option value="galil_north">צימרים בצפון</option>
                  <option value="galil_west">צימרים בגליל המערבי</option>
                  <option value="galil_upper">צימרים בגליל העליון</option>
                  <option value="galil_lower">צימרים בגליל התחתון</option>
                  <option value="kinneret">צימרים בכנרת</option>
                  <option value="hermon">צימרים בחרמון</option>
                  <option value="center">צימרים במרכז</option>
                  <option value="jerusalem">צימרים בירושלים</option>
                  <option value="dead_sea">צימרים בים המלח</option>
                  <option value="negev">צימרים בדרום</option>
                  <option value="eilat">צימרים באילת</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">עיר/יישוב</label>
                <input name="city" value={form.city} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">כתובת</label>
                <input name="address" value={form.address} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
              </div>
            </div>
          </div>

          {/* גלריית תמונות */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-700 text-lg mb-1">תמונות הנכס</h2>
            <p className="text-xs text-gray-400 mb-4">לחץ על כוכב להגדרת תמונה ראשית. לחץ X למחיקה.</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative group aspect-video">
                  <img src={img.url} alt="" className="w-full h-full object-cover rounded-xl" />
                  {img.isPrimary && (
                    <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-1">
                      <Star className="w-3 h-3 text-white fill-white" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                    <button type="button" onClick={() => setPrimary(idx)}
                      className="p-1.5 bg-yellow-500 rounded-full" title="הגדר כראשית">
                      <Star className="w-3.5 h-3.5 text-white" />
                    </button>
                    <button type="button" onClick={() => removeImage(idx)}
                      className="p-1.5 bg-red-500 rounded-full" title="מחק">
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
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
            <p className="text-xs text-gray-400">{images.length}/14 תמונות · התמונה הראשית מסומנת בכוכב זהב</p>
            <p className="text-xs text-gray-400 mt-1">* מקסימום 14 תמונות · גודל מקסימלי לתמונה: 2MB</p>
          </div>

          {/* תמחור */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-700 text-lg">תמחור וקיבולת</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מחיר ללילה (₪) *</label>
                <input name="price_per_night" type="number" value={form.price_per_night} onChange={handleChange} required min="1"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" placeholder="500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מינימום לילות</label>
                <input name="min_nights" type="number" value={form.min_nights} onChange={handleChange} min="1"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מקסימום אורחים</label>
                <input name="max_guests" type="number" value={form.max_guests} onChange={handleChange} min="1"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">חדרי שינה</label>
                <input name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} min="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">חדרי רחצה</label>
                <input name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} min="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="instant_book" id="instant_book" checked={form.instant_book} onChange={handleChange} className="w-4 h-4 accent-yellow-600" />
              <label htmlFor="instant_book" className="text-sm font-medium text-gray-700">הזמנה מיידית</label>
            </div>
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

          <div className="flex gap-3">
            <button type="submit" disabled={loading || uploading} className="flex-1 py-3 rounded-xl font-bold text-white text-sm" style={{ backgroundColor: '#8B6914' }}>
              {uploading ? 'מעלה תמונות...' : loading ? 'שומר...' : 'הוסף נכס'}
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
