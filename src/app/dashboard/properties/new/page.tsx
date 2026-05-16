'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { REGIONS } from '@/lib/constants'

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

export default function NewPropertyPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('יש להתחבר תחילה'); setLoading(false); return }
    const { error: insertError } = await supabase.from('properties').insert({
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
    })
    if (insertError) { setError(insertError.message); setLoading(false); return }
    router.push('/dashboard/owner')
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">הוספת נכס חדש</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-700 text-lg">פרטי הנכס</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שם הנכס *</label>
              <input name="name" value={form.name} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" placeholder="לדוגמה: צימר הגליל הקסום" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תיאור קצר</label>
              <input name="short_description" value={form.short_description} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" placeholder="משפט אחד שמתאר את הנכס" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תיאור מלא</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600 resize-none" placeholder="תאר את הנכס בפירוט..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">סוג נכס *</label>
                <select name="category" value={form.category} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600">
                  {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">איזור *</label>
                <select name="region" value={form.region} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600">
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
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-700 text-lg">תמחור וקיבולת</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מחיר ללילה (₪) *</label>
                <input name="price_per_night" type="number" value={form.price_per_night} onChange={handleChange} required min="1" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" placeholder="500" />
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
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl font-bold text-white text-sm" style={{ backgroundColor: '#8B6914' }}>
              {loading ? 'שומר...' : 'הוסף נכס'}
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
