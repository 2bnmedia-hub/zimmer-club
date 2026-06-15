'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { IconSearch, IconMapPin, IconCalendar, IconUsers, IconHome, IconChevronDown, IconChevronUp, IconChevronLeft, IconChevronRight, IconStar, IconHeart, IconUser, IconPhone, IconGlobe, IconNavigation, IconArrowRight, IconZap, IconEye, IconEyeOff, IconUpload, IconTrash, IconEdit, IconPlus, IconCheck, IconMail, IconSend, IconRefresh, IconSparkles, IconBed, IconBath, IconTrendingUp, IconLoader, IconCamera, IconSave, IconAlertCircle, IconCheckCircle, IconClock, IconSliders, IconPencil, IconQr, IconShare, IconDownload, IconZoomIn, IconZoomOut, IconLogOut, IconSettings, IconMenu, IconX } from '@/components/icons'

const PROPERTY_TYPES = [
  { value: 'zimmer', label: 'צימר' },
  { value: 'complex', label: 'מתחם צימרים' },
  { value: 'villa', label: 'וילות ובקתות' },
  { value: 'hotel', label: 'מלונות' },
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

type UnitForm = {
  name: string
  description: string
  price_per_night: string
  max_guests: string
  bedrooms: string
  bathrooms: string
  images: ImagePreview[]
}

type ImagePreview = {
  file: File
  url: string
  isPrimary: boolean
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

declare global {
  interface Window { initGooglePlaces: () => void; google: any }
}

export default function NewPropertyPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [images, setImages] = useState<ImagePreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState('')
  const [videoAsPrimary, setVideoAsPrimary] = useState(false)
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
  const [units, setUnits] = useState<UnitForm[]>([])
  const [hasUnits, setHasUnits] = useState(false)
  const [form, setForm] = useState({
    name: '',
    name_en: '',
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
    accepts_miluim: false,
    has_shelter: false,
    video_url: '',
    phone_landline: '',
    whatsapp1: '',
    whatsapp2: '',
    email1: '',
    email2: '',
    contact_via_phone_landline: false,
    contact_via_whatsapp1: false,
    contact_via_whatsapp2: false,
    contact_via_email1: false,
    contact_via_email2: false,
  })

  const addUnit = () => {
    setUnits(prev => [...prev, { name: '', description: '', price_per_night: '', max_guests: '2', bedrooms: '1', bathrooms: '1', images: [] }])
  }

  const removeUnit = (idx: number) => setUnits(prev => prev.filter((_, i) => i !== idx))

  const updateUnit = (idx: number, field: keyof UnitForm, value: string) => {
    setUnits(prev => prev.map((u, i) => i === idx ? { ...u, [field]: value } : u))
  }

  const handleUnitImageSelect = (unitIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const toAdd = Array.from(files).slice(0, 8).map((file, i) => ({
      file, url: URL.createObjectURL(file), isPrimary: i === 0
    }))
    setUnits(prev => prev.map((u, i) => i === unitIdx ? { ...u, images: [...u.images, ...toAdd].slice(0, 8) } : u))
    e.target.value = ''
  }

  const removeUnitImage = (unitIdx: number, imgIdx: number) => {
    setUnits(prev => prev.map((u, i) => i === unitIdx ? { ...u, images: u.images.filter((_, ii) => ii !== imgIdx) } : u))
  }

  const uploadUnitImages = async (unitId: string, images: ImagePreview[]) => {
    for (let i = 0; i < images.length; i++) {
      const img = images[i]
      const ext = img.file.name.split('.').pop()
      const fileName = `units/${unitId}/${Date.now()}_${i}.${ext}`
      const { error } = await supabase.storage.from('property-images').upload(fileName, img.file)
      if (!error) {
        const { data } = supabase.storage.from('property-images').getPublicUrl(fileName)
        await supabase.from('property_unit_images').insert({ unit_id: unitId, url: data.publicUrl, order: i })
      }
    }
  }

  async function geocodeAddress(city: string, address: string) {
    const query = [address, city, 'ישראל'].filter(Boolean).join(', ')
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=il`, {
        headers: { 'Accept-Language': 'he' }
      })
      const data = await res.json()
      if (data?.[0]) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
      }
    } catch {}
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value

    if (name === 'name_en') {
      const slug = toSlug(value)
      setSlugPreview(slug)
      setForm(prev => ({ ...prev, name_en: value }))
      return
    }

    setForm(prev => ({ ...prev, [name]: newValue }))
  }

  const toggleAmenity = (key: string) => {
    setSelectedAmenities(prev => prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key])
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 25 * 1024 * 1024) { alert('הוידאו גדול מ-25MB'); return }
    setVideoFile(file)
    setVideoPreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const valid = Array.from(files).filter(f => {
      if (f.size > 2 * 1024 * 1024) { alert(`הקובץ "${f.name}" גדול מ-2MB`); return false }
      return true
    })
    const remaining = 14 - images.length
    const toAdd = valid.slice(0, remaining)
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
    setVideoAsPrimary(false); setImages(prev => prev.map((img, i) => ({ ...img, isPrimary: i === idx })))
  }

  const uploadVideo = async (propertyId: string): Promise<string | null> => {
    if (!videoFile) return null
    const ext = videoFile.name.split('.').pop()
    const fileName = `${propertyId}/video_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('property-images').upload(fileName, videoFile)
    if (error) return null
    const { data } = supabase.storage.from('property-images').getPublicUrl(fileName)
    return data.publicUrl
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
          property_id: propertyId, url: urlData.publicUrl, order: i, is_primary: img.isPrimary,
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name_en.trim()) { setError('יש להזין שם נכס באנגלית'); return }
    const slug = toSlug(form.name_en)
    if (!slug) { setError('שם הנכס באנגלית אינו תקין'); return }

    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('יש להתחבר תחילה'); setLoading(false); return }

    // בדוק שה-slug לא תפוס
    const { data: existing } = await supabase.from('properties').select('id').eq('slug', slug).single()
    if (existing) { setError('שם זה כבר תפוס — נסה שם אחר'); setLoading(false); return }

    const geoCoords = await geocodeAddress(form.city, form.address)

    const { data: property, error: insertError } = await supabase.from('properties').insert({
      owner_id: user.id,
      name: form.name,
      slug,
      short_description: form.short_description,
      description: form.description,
      category: [form.category],
      region: form.region,
      city: form.city,
      address: form.address,
      price_per_night: parseInt(form.price_per_night) || 0,
      min_nights: parseInt(form.min_nights),
      max_guests: parseInt(form.max_guests),
      bedrooms: parseInt(form.bedrooms),
      bathrooms: parseInt(form.bathrooms),
      instant_book: form.instant_book,
      accepts_miluim: form.accepts_miluim,
      has_shelter: form.has_shelter,
      status: 'pending',
      lat: geoCoords?.lat || null,
      lng: geoCoords?.lng || null,
      video_url: form.video_url || null,
      phone_landline: form.phone_landline || null,
      whatsapp1: form.whatsapp1 || null,
      whatsapp2: form.whatsapp2 || null,
      email1: form.email1 || null,
      email2: form.email2 || null,
      contact_via_phone_landline: form.contact_via_phone_landline,
      contact_via_whatsapp1: form.contact_via_whatsapp1,
      contact_via_whatsapp2: form.contact_via_whatsapp2,
      contact_via_email1: form.contact_via_email1,
      contact_via_email2: form.contact_via_email2,
    }).select().single()

    if (insertError) { setError(insertError.message); setLoading(false); return }

    setUploading(true)
    if (images.length > 0) await uploadImages(property.id)
    let finalVideoUrl = form.video_url || null
    if (videoFile) {
      const uploaded = await uploadVideo(property.id)
      if (uploaded) finalVideoUrl = uploaded
    }
    if (finalVideoUrl) await supabase.from('properties').update({ video_url: finalVideoUrl }).eq('id', property.id)

    if (selectedAmenities.length > 0) {
      const { data: amenityRows } = await supabase.from('amenities').select('id, key').in('key', selectedAmenities)
      if (amenityRows) {
        await supabase.from('property_amenities').insert(amenityRows.map(a => ({ property_id: property.id, amenity_id: a.id })))
      }
    }

    if (hasUnits && units.length > 0) {
      for (let i = 0; i < units.length; i++) {
        const u = units[i]
        if (!u.name.trim()) continue
        const { data: unitData } = await supabase.from('property_units').insert({
          property_id: property.id,
          name: u.name,
          description: u.description,
          price_per_night: parseInt(u.price_per_night) || null,
          max_guests: parseInt(u.max_guests) || null,
          bedrooms: parseInt(u.bedrooms) || null,
          bathrooms: parseInt(u.bathrooms) || null,
          sort_order: i,
        }).select().single()
        if (unitData && u.images.length > 0) {
          await uploadUnitImages(unitData.id, u.images)
        }
      }
    }

    setUploading(false)
    router.push('/dashboard/owner')
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">הוספת נכס חדש</h1>
        <p className="text-sm text-red-500 mb-8">במידה ויש כמה יחידות/נכסים במתחם, ניתן להוסיף אותם בסוף הדף</p>
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

            {/* שדה שם באנגלית — חדש */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                שם הנכס באנגלית * <span className="text-gray-400 font-normal">(ישמש ככתובת האתר)</span>
              </label>
              <input name="name_en" value={form.name_en} onChange={handleChange} required
                className="w-full border border-yellow-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600 bg-yellow-50"
                placeholder="galil-zimmer" dir="ltr" />
              {slugPreview && (
                <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                  כתובת האתר שלך:
                  <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-green-700">
                    zimmer.club/{slugPreview}
                  </span>
                </p>
              )}
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
                  <option value="north">צפון</option>
                  <option value="galil_west">גליל המערבי</option>
                  <option value="galil_upper">גליל העליון</option>
                  <option value="galil_lower">גליל התחתון</option>
                  <option value="kinneret">כנרת</option>
                  <option value="hermon">חרמון</option>
                  <option value="center">מרכז</option>
                  <option value="jerusalem">ירושלים</option>
                  <option value="dead_sea">ים המלח</option>
                  <option value="negev">דרום</option>
                  <option value="eilat">אילת</option>
                  <option value="golan">רמת הגולן</option>
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

          {/* אמצעי תקשורת */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-700 text-lg">אמצעי תקשורת לקבלת הזמנות</h2>
            <p className="text-xs text-gray-400">סמן ✓ ליד האמצעים שדרכם תרצה לקבל הזמנות</p>
            {[
              { checkName: 'contact_via_phone_landline', fieldName: 'phone_landline', label: 'טלפון קווי', placeholder: '03-1234567' },
              { checkName: 'contact_via_whatsapp1', fieldName: 'whatsapp1', label: 'וואטסאפ עסקי 1', placeholder: '972501234567' },
              { checkName: 'contact_via_whatsapp2', fieldName: 'whatsapp2', label: 'וואטסאפ עסקי 2', placeholder: '972501234567' },
              { checkName: 'contact_via_email1', fieldName: 'email1', label: 'אימייל עסקי 1', placeholder: 'business@example.com', type: 'email' },
              { checkName: 'contact_via_email2', fieldName: 'email2', label: 'אימייל עסקי 2', placeholder: 'business2@example.com', type: 'email' },
            ].map(({ checkName, fieldName, label, placeholder, type }) => (
              <div key={fieldName} className="flex items-center gap-3">
                <input type="checkbox" name={checkName} id={checkName}
                  checked={(form as any)[checkName]} onChange={handleChange}
                  className="w-4 h-4 accent-yellow-600 shrink-0" />
                <div className="flex-1">
                  <label htmlFor={checkName} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input name={fieldName} value={(form as any)[fieldName]} onChange={handleChange}
                    placeholder={placeholder} dir="ltr" type={type || 'text'}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
                </div>
              </div>
            ))}
          </div>

          {/* גלריית תמונות */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-700 text-lg mb-1">תמונות הנכס</h2>
            <p className="text-xs text-gray-400 mb-4">לחץ על כוכב להגדרת תמונה ראשית. לחץ X למחיקה.</p>
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
            <p className="text-xs text-gray-400">{images.length}/14 תמונות · התמונה הראשית מסומנת בכוכב זהב</p>
          </div>

          {/* וידאו */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-700 text-lg mb-1">וידאו הנכס</h2>
            <p className="text-xs text-gray-400 mb-4">העלה וידאו (עד 25MB) או הדבק קישור YouTube/Vimeo</p>
            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-yellow-600 transition-colors">
                <span className="text-2xl">🎬</span>
                <span className="text-sm text-gray-500">{videoFile ? videoFile.name : 'לחץ להעלאת וידאו (MP4, MOV — עד 25MB)'}</span>
                <input type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
              </label>
              {videoPreview && <div className="relative">
                <video src={videoPreview} controls className="w-full rounded-xl max-h-48" />
                <button type="button" onClick={() => { setVideoAsPrimary(true); setImages(prev => prev.map(img => ({...img, isPrimary: false}))); }} className={`absolute top-2 right-2 rounded-full p-1.5 transition-colors ${videoAsPrimary ? "bg-yellow-500" : "bg-black/40 hover:bg-yellow-500"}`}><IconStar className="w-4 h-4 text-white fill-white" /></button>
              </div>}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400">או</span><div className="flex-1 h-px bg-gray-200" />
              </div>
              <input name="video_url" value={form.video_url} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"
                placeholder="https://www.youtube.com/watch?v=..." dir="ltr" />
            </div>
          </div>

          {/* תמחור */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-700 text-lg">תמחור וקיבולת</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מחיר ללילה (₪)</label>
                <input name="price_per_night" type="number" value={form.price_per_night} onChange={handleChange} min="0"
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
            <div className="space-y-2">
              {[
                { name: 'instant_book', label: 'הזמנה מיידית' },
                { name: 'accepts_miluim', label: 'מקבלים שובר מילואים' },
                { name: 'has_shelter', label: 'קיים מרחב מוגן' },
              ].map(({ name, label }) => (
                <div key={name} className="flex items-center gap-2">
                  <input type="checkbox" name={name} id={name} checked={(form as any)[name]} onChange={handleChange} className="w-4 h-4 accent-yellow-600" />
                  <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>
                </div>
              ))}
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

          {/* יחידות במתחם */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-gray-700 text-lg">להוספת נכס נוסף (למתחם מרובה נכסים)</h2>
                <p className="text-xs text-gray-400 mt-0.5">לנכסים עם מספר סוויטות, בקתות או צימרים נפרדים</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="hasUnits" checked={hasUnits} onChange={e => setHasUnits(e.target.checked)} className="w-4 h-4 accent-yellow-600" />
                <label htmlFor="hasUnits" className="text-sm font-medium text-gray-700">יש יחידות נפרדות</label>
              </div>
            </div>

            {hasUnits && (
              <div className="space-y-6">
                {units.map((unit, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-2xl p-5 relative">
                    <button type="button" onClick={() => removeUnit(idx)} className="absolute top-3 left-3 p-1.5 rounded-full bg-red-50 hover:bg-red-100 transition-colors">
                      <IconX className="w-4 h-4 text-red-500" />
                    </button>
                    <p className="font-bold text-gray-700 mb-4">יחידה {idx + 1}</p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">שם היחידה *</label>
                        <input value={unit.name} onChange={e => updateUnit(idx, 'name', e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-600"
                          placeholder="סוויטה 1 / בקתה א'" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">מחיר החל מ (₪ ללילה)</label>
                        <input type="number" value={unit.price_per_night} onChange={e => updateUnit(idx, 'price_per_night', e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-600"
                          placeholder="500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">אורחים</label>
                        <input type="number" value={unit.max_guests} onChange={e => updateUnit(idx, 'max_guests', e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-600" min="1" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">חדרי שינה</label>
                        <input type="number" value={unit.bedrooms} onChange={e => updateUnit(idx, 'bedrooms', e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-600" min="0" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">חדרי רחצה</label>
                        <input type="number" value={unit.bathrooms} onChange={e => updateUnit(idx, 'bathrooms', e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-600" min="0" />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-600 mb-1">תיאור</label>
                      <textarea value={unit.description} onChange={e => updateUnit(idx, 'description', e.target.value)} rows={2}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-600 resize-none"
                        placeholder="תיאור קצר של היחידה..." />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">תמונות היחידה (עד 8)</label>
                      <div className="grid grid-cols-4 gap-2">
                        {unit.images.map((img, imgIdx) => (
                          <div key={imgIdx} className="relative aspect-video group">
                            <img src={img.url} alt="" className="w-full h-full object-cover rounded-lg" />
                            <button type="button" onClick={() => removeUnitImage(idx, imgIdx)}
                              className="absolute top-1 right-1 bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <IconX className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ))}
                        {unit.images.length < 8 && (
                          <label className="aspect-video border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-yellow-600 transition-colors">
                            <IconUpload className="w-5 h-5 text-gray-300" />
                            <input type="file" accept="image/*" multiple onChange={e => handleUnitImageSelect(idx, e)} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addUnit}
                  className="w-full py-3 border-2 border-dashed border-yellow-300 rounded-2xl text-sm font-bold text-yellow-700 hover:border-yellow-500 hover:bg-yellow-50 transition-colors flex items-center justify-center gap-2">
                  <IconPlus className="w-4 h-4" /> הוסף יחידה
                </button>
              </div>
            )}
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
