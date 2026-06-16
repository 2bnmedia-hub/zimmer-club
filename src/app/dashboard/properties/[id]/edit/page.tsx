'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { IconSearch, IconMapPin, IconCalendar, IconUsers, IconHome, IconChevronDown, IconChevronUp, IconChevronLeft, IconChevronRight, IconStar, IconHeart, IconUser, IconPhone, IconGlobe, IconNavigation, IconArrowRight, IconZap, IconEye, IconEyeOff, IconUpload, IconTrash, IconEdit, IconPlus, IconCheck, IconMail, IconSend, IconRefresh, IconSparkles, IconBed, IconBath, IconTrendingUp, IconLoader, IconCamera, IconSave, IconAlertCircle, IconCheckCircle, IconClock, IconSliders, IconPencil, IconQr, IconShare, IconDownload, IconZoomIn, IconZoomOut, IconLogOut, IconSettings, IconMenu, IconX } from '@/components/icons'
import { PropertyQR } from '@/components/property/PropertyQR'
import { AdminReviews } from '@/components/property/AdminReviews'
import { createPortal } from 'react-dom'

const PROPERTY_TYPES = [
  { value: 'zimmer', label: 'צימר' },
  { value: 'complex', label: 'מתחם צימרים' },
  { value: 'villa', label: 'וילות ובקתות' },
  { value: 'caravan', label: 'קרוואנים' },
  { value: 'hotel', label: 'מלונות' },
  { value: 'camping', label: 'קמפינג' },
  { value: 'attraction', label: 'אטרקציות' },
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
  id?: string
  name: string
  description: string
  price_per_night: string
  max_guests: string
  bedrooms: string
  bathrooms: string
  video_url: string
  isNew?: boolean
  toDelete?: boolean
}

type UnitImage = {
  id: string
  url: string
  order: number
}

type PropertyImage = {
  id: string
  url: string
  is_primary: boolean
  order: number
}

type DateStatus = 'blocked'

type OwnerItem = {
  id: string
  name: string
  type: 'property' | 'caravan' | 'attraction'
  status: string
}

const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
]
const HEBREW_DAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']

function Calendar({ propertyId, supabase }: { propertyId: string; supabase: ReturnType<typeof createClient> }) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [dateMap, setDateMap] = useState<Record<string, DateStatus>>({})
  const [loadingDates, setLoadingDates] = useState(true)

  useEffect(() => {
    async function loadDates() {
      setLoadingDates(true)
      const { data } = await supabase.from('blocked_dates').select('date, status').eq('property_id', propertyId)
      if (data) {
        const map: Record<string, DateStatus> = {}
        data.forEach((d: any) => { map[d.date] = d.status })
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
    if (!current) {
      const { error } = await supabase.from('blocked_dates').upsert({ property_id: propertyId, date: dateStr, status: 'blocked' }, { onConflict: 'property_id,date' })
      if (!error) setDateMap(prev => ({ ...prev, [dateStr]: 'blocked' }))
    } else {
      const { error } = await supabase.from('blocked_dates').delete().eq('property_id', propertyId).eq('date', dateStr)
      if (!error) setDateMap(prev => { const next = { ...prev }; delete next[dateStr]; return next })
    }
  }
  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) } else setCurrentMonth(m => m - 1) }
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) } else setCurrentMonth(m => m + 1) }
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
    return 'hover:bg-yellow-50 hover:text-yellow-700 cursor-pointer text-gray-700'
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="font-bold text-gray-700 text-lg mb-1">ניהול זמינות</h2>
      <p className="text-xs text-gray-400 mb-4">לחץ על יום לשינוי סטטוס: פנוי ← תפוס ← פנוי</p>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-white border border-gray-200" /><span className="text-xs text-gray-500">פנוי</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><span className="text-xs text-gray-500">תפוס</span></div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100"><IconChevronRight className="w-4 h-4 text-gray-500" /></button>
        <span className="font-bold text-gray-800 text-sm">{HEBREW_MONTHS[currentMonth]} {currentYear}</span>
        <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100"><IconChevronLeft className="w-4 h-4 text-gray-500" /></button>
      </div>
      {loadingDates ? <div className="text-center py-8 text-gray-400 text-sm">טוען תאריכים...</div> : (
        <div className="grid grid-cols-7 gap-1">
          {HEBREW_DAYS.map(d => <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>)}
          {blanks.map((_, i) => <div key={`blank-${i}`} />)}
          {days.map(day => {
            const isPast = new Date(formatDate(day)) < new Date(today.toDateString())
            return <button key={day} type="button" disabled={isPast} onClick={() => handleDayClick(day)} className={`aspect-square rounded-lg text-xs flex items-center justify-center transition-colors ${getDayStyle(day)}`}>{day}</button>
          })}
        </div>
      )}
    </div>
  )
}

function OwnerNav({ currentId, ownerItems, router }: { currentId: string; ownerItems: OwnerItem[]; router: ReturnType<typeof useRouter> }) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 })
  const current = ownerItems.find(i => i.id === currentId)

  const typeLabel = (type: OwnerItem['type']) => type === 'property' ? '🏠' : type === 'caravan' ? '🚐' : '🎯'
  const editPath = (item: OwnerItem) => item.type === 'property' ? `/dashboard/properties/${item.id}/edit` : item.type === 'caravan' ? `/dashboard/caravans/${item.id}/edit` : `/dashboard/attractions/${item.id}/edit`
  const statusDot = (status: string) => status === 'active' ? 'bg-green-400' : status === 'pending' ? 'bg-yellow-400' : status === 'rejected' ? 'bg-red-400' : 'bg-gray-300'

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setDropPos({ top: rect.bottom + 8, left: rect.left, width: Math.max(rect.width, 260) })
    }
    setOpen(o => !o)
  }

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => { if (btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  if (ownerItems.length <= 1) return null

  const properties = ownerItems.filter(i => i.type === 'property')
  const caravans = ownerItems.filter(i => i.type === 'caravan')
  const attractions = ownerItems.filter(i => i.type === 'attraction')

  return (
    <div className="relative">
      <button ref={btnRef} type="button" onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-yellow-500 transition-colors shadow-sm">
        <span>{typeLabel(current?.type || 'property')}</span>
        <span className="max-w-[180px] truncate">{current?.name || 'בחר נכס'}</span>
        <IconChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && typeof window !== 'undefined' && createPortal(
        <div style={{ position: 'fixed', top: dropPos.top, left: dropPos.left, width: dropPos.width, zIndex: 999999 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
          onMouseDown={e => e.stopPropagation()}>
          {properties.length > 0 && <>
            <div className="px-3 pt-3 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">🏠 נכסים</div>
            {properties.map(item => (
              <button key={item.id} type="button" onClick={() => { setOpen(false); router.push(editPath(item)) }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-right hover:bg-yellow-50 transition-colors ${item.id === currentId ? 'bg-yellow-50 font-bold text-yellow-800' : 'text-gray-700'}`}>
                <div className={`w-2 h-2 rounded-full shrink-0 ${statusDot(item.status)}`} />
                <span className="flex-1 truncate">{item.name}</span>
                {item.id === currentId && <IconCheck className="w-3.5 h-3.5 text-yellow-600 shrink-0" />}
              </button>
            ))}
          </>}
          {caravans.length > 0 && <>
            <div className="px-3 pt-3 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">🚐 קרוואנים</div>
            {caravans.map(item => (
              <button key={item.id} type="button" onClick={() => { setOpen(false); router.push(editPath(item)) }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-right hover:bg-yellow-50 transition-colors ${item.id === currentId ? 'bg-yellow-50 font-bold text-yellow-800' : 'text-gray-700'}`}>
                <div className={`w-2 h-2 rounded-full shrink-0 ${statusDot(item.status)}`} />
                <span className="flex-1 truncate">{item.name}</span>
                {item.id === currentId && <IconCheck className="w-3.5 h-3.5 text-yellow-600 shrink-0" />}
              </button>
            ))}
          </>}
          {attractions.length > 0 && <>
            <div className="px-3 pt-3 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">🎯 אטרקציות</div>
            {attractions.map(item => (
              <button key={item.id} type="button" onClick={() => { setOpen(false); router.push(editPath(item)) }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-right hover:bg-yellow-50 transition-colors ${item.id === currentId ? 'bg-yellow-50 font-bold text-yellow-800' : 'text-gray-700'}`}>
                <div className={`w-2 h-2 rounded-full shrink-0 ${statusDot(item.status)}`} />
                <span className="flex-1 truncate">{item.name}</span>
                {item.id === currentId && <IconCheck className="w-3.5 h-3.5 text-yellow-600 shrink-0" />}
              </button>
            ))}
          </>}
          <div className="border-t border-gray-100 mt-1">
            <button type="button" onClick={() => { setOpen(false); router.push('/dashboard/owner') }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
              <IconArrowRight className="w-4 h-4" />חזרה ללוח הבקרה
            </button>
          </div>
        </div>,
        document.body
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
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState('')
  const [videoAsPrimary, setVideoAsPrimary] = useState(false)
  const [ownerItems, setOwnerItems] = useState<OwnerItem[]>([])
  const [units, setUnits] = useState<UnitForm[]>([])
  const [unitImages, setUnitImages] = useState<Record<string, UnitImage[]>>({})
  const [unitUploading, setUnitUploading] = useState<Record<string, boolean>>({})
  const [form, setForm] = useState({
    name: '', slug: '', short_description: '', description: '', category: 'zimmer',
    region: '', city: '', address: '', price_per_night: '', min_nights: '1',
    max_guests: '2', bedrooms: '1', bathrooms: '1', instant_book: false,
    accepts_miluim: false, has_shelter: false, status: 'pending', video_url: '',
    phone_landline: '', whatsapp1: '', whatsapp2: '', email1: '', email2: '',
    contact_via_phone_landline: false, contact_via_whatsapp1: false,
    contact_via_whatsapp2: false, contact_via_email1: false, contact_via_email2: false,
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
        name: property.name || '', slug: property.slug || '',
        short_description: property.short_description || '', description: property.description || '',
        category: property.category?.[0] || 'zimmer', region: property.region || '',
        city: property.city || '', address: property.address || '',
        price_per_night: property.price_per_night?.toString() || '', min_nights: property.min_nights?.toString() || '1',
        max_guests: property.max_guests?.toString() || '2', bedrooms: property.bedrooms?.toString() || '1',
        bathrooms: property.bathrooms?.toString() || '1', instant_book: property.instant_book || false,
        accepts_miluim: property.accepts_miluim || false, has_shelter: property.has_shelter || false,
        video_url: property.video_url || '', status: property.status || 'pending',
        phone_landline: property.phone_landline || '', whatsapp1: property.whatsapp1 || '',
        whatsapp2: property.whatsapp2 || '', email1: property.email1 || '', email2: property.email2 || '',
        contact_via_phone_landline: property.contact_via_phone_landline || false,
        contact_via_whatsapp1: property.contact_via_whatsapp1 || false,
        contact_via_whatsapp2: property.contact_via_whatsapp2 || false,
        contact_via_email1: property.contact_via_email1 || false,
        contact_via_email2: property.contact_via_email2 || false,
      })
      const { data: imgData } = await supabase.from('property_images').select('*').eq('property_id', params.id).order('order')
      setImages(imgData || [])
      const { data: amenityData } = await supabase.from('property_amenities').select('amenity_id').eq('property_id', params.id)
      if (amenityData && amenityData.length > 0) {
        const ids = amenityData.map((a: any) => a.amenity_id)
        const { data: amenitiesData } = await supabase.from('amenities').select('key').in('id', ids)
        setSelectedAmenities(amenitiesData?.map((a: any) => a.key).filter(Boolean) || [])
      } else {
        setSelectedAmenities([])
      }
      const ownerId = profile?.role === 'admin' ? property.owner_id : user.id
      const [{ data: props }, { data: caravans }, { data: attractions }] = await Promise.all([
        supabase.from('properties').select('id, name, status').eq('owner_id', ownerId).order('created_at'),
        supabase.from('caravans').select('id, name, status').eq('owner_id', ownerId).order('created_at'),
        supabase.from('attractions').select('id, name, status').eq('owner_id', ownerId).order('created_at'),
      ])
      setOwnerItems([
        ...(props || []).map((p: any) => ({ id: p.id, name: p.name, type: 'property' as const, status: p.status })),
        ...(caravans || []).map((c: any) => ({ id: c.id, name: c.name, type: 'caravan' as const, status: c.status })),
        ...(attractions || []).map((a: any) => ({ id: a.id, name: a.name, type: 'attraction' as const, status: a.status })),
      ])

      // טען יחידות
      const { data: unitsData } = await supabase.from('property_units').select('*').eq('property_id', params.id).order('sort_order')
      if (unitsData) {
        setUnits(unitsData.map((u: any) => ({
          id: u.id,
          name: u.name || '',
          description: u.description || '',
          price_per_night: u.price_per_night?.toString() || '',
          max_guests: u.max_guests?.toString() || '',
          bedrooms: u.bedrooms?.toString() || '',
          bathrooms: u.bathrooms?.toString() || '',
          video_url: u.video_url || '',
        })))
        // טען תמונות לכל יחידה
        const imgMap: Record<string, UnitImage[]> = {}
        for (const u of unitsData) {
          const { data: imgs } = await supabase.from('property_unit_images').select('*').eq('unit_id', u.id).order('order')
          imgMap[u.id] = imgs || []
        }
        setUnitImages(imgMap)
      }

      setLoading(false)
    }
    load()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }))
  }
  const toggleAmenity = (key: string) => setSelectedAmenities(prev => prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key])
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 25 * 1024 * 1024) { alert('הוידאו גדול מ-25MB'); return }
    setVideoFile(file); setVideoPreview(URL.createObjectURL(file)); e.target.value = ''
  }
  const uploadVideo = async (): Promise<string | null> => {
    if (!videoFile) return null
    const ext = videoFile.name.split('.').pop()
    const fileName = `${String(params.id)}/video_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('property-images').upload(fileName, videoFile)
    if (error) return null
    const { data } = supabase.storage.from('property-images').getPublicUrl(fileName)
    return data.publicUrl
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
        const { data: newImg } = await supabase.from('property_images').insert({ property_id: params.id, url: urlData.publicUrl, 'order': images.length, is_primary: isPrimary }).select().single()
        if (newImg) setImages(prev => [...prev, newImg])
      }
    }
    setUploading(false); e.target.value = ''
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
    e.preventDefault(); setSaving(true); setError('')
    const { error: updateError } = await supabase.from('properties').update({
      name: form.name, slug: form.slug || undefined, short_description: form.short_description,
      description: form.description, category: [form.category], region: form.region,
      city: form.city, address: form.address, price_per_night: parseInt(form.price_per_night),
      min_nights: parseInt(form.min_nights), max_guests: parseInt(form.max_guests),
      bedrooms: parseInt(form.bedrooms), bathrooms: parseInt(form.bathrooms),
      instant_book: form.instant_book, accepts_miluim: form.accepts_miluim, has_shelter: form.has_shelter,
      ...(isAdmin && { status: form.status }), video_url: form.video_url || null,
      phone_landline: form.phone_landline || null, whatsapp1: form.whatsapp1 || null,
      whatsapp2: form.whatsapp2 || null, email1: form.email1 || null, email2: form.email2 || null,
      contact_via_phone_landline: form.contact_via_phone_landline, contact_via_whatsapp1: form.contact_via_whatsapp1,
      contact_via_whatsapp2: form.contact_via_whatsapp2, contact_via_email1: form.contact_via_email1,
      contact_via_email2: form.contact_via_email2, updated_at: new Date().toISOString(),
    }).eq('id', params.id)
    if (updateError) {
      setError(updateError.message)
    } else {
      const propertyId = String(params.id)
      await supabase.from('property_amenities').delete().eq('property_id', propertyId)
      if (selectedAmenities.length > 0) {
        const { data: allAmenities } = await supabase.from('amenities').select('id, key')
        const amenityRows = (allAmenities || []).filter((a: any) => selectedAmenities.includes(a.key)).map((a: any) => ({ property_id: propertyId, amenity_id: a.id }))
        if (amenityRows.length > 0) await supabase.from('property_amenities').insert(amenityRows)
      }
      if (videoFile) {
        const uploadedUrl = await uploadVideo()
        if (uploadedUrl) { await supabase.from('properties').update({ video_url: uploadedUrl }).eq('id', params.id); setForm(prev => ({ ...prev, video_url: uploadedUrl })) }
      }
      setSuccess(true); setTimeout(() => setSuccess(false), 3000)
    }

      // שמור יחידות
      for (const unit of units) {
        if (unit.toDelete && unit.id) {
          await supabase.from('property_units').delete().eq('id', unit.id)
        } else if (unit.isNew && unit.name.trim()) {
          await supabase.from('property_units').insert({
            property_id: String(params.id),
            name: unit.name,
            description: unit.description,
            price_per_night: parseInt(unit.price_per_night) || null,
            max_guests: parseInt(unit.max_guests) || null,
            bedrooms: parseInt(unit.bedrooms) || null,
            bathrooms: parseInt(unit.bathrooms) || null,
            sort_order: units.indexOf(unit),
          })
        } else if (unit.id && !unit.toDelete) {
          await supabase.from('property_units').update({
            name: unit.name,
            description: unit.description,
            price_per_night: parseInt(unit.price_per_night) || null,
            max_guests: parseInt(unit.max_guests) || null,
            bedrooms: parseInt(unit.bedrooms) || null,
            bathrooms: parseInt(unit.bathrooms) || null,
            video_url: unit.video_url || null,
          }).eq('id', unit.id)
        }
      }
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">טוען...</div></div>

  return (
    <div className="min-h-screen bg-gray-50 pt-4" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.push('/dashboard/owner')} className="p-2 rounded-lg hover:bg-gray-100">
            <IconArrowRight className="w-5 h-5 text-gray-500" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex-1">עריכת נכס</h1>
          <OwnerNav currentId={String(params.id)} ownerItems={ownerItems} router={router} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Calendar propertyId={params.id as string} supabase={supabase} />

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-700 text-lg mb-2">גלריית תמונות</h2>
            <p className="text-xs text-gray-400 mb-4">לחץ על כוכב להגדרת תמונה ראשית. לחץ X למחיקה.</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {images.map((img) => (
                <div key={img.id} className="relative group aspect-video">
                  <img src={img.url} alt="" className="w-full h-full object-cover rounded-xl" />
                  {img.is_primary && <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-1"><IconStar className="w-3 h-3 text-white fill-white" /></div>}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                    <button type="button" onClick={() => handleSetPrimary(img.id)} className="p-1.5 bg-yellow-500 rounded-full"><IconStar className="w-3.5 h-3.5 text-white" /></button>
                    <button type="button" onClick={() => handleDeleteImage(img.id)} className="p-1.5 bg-red-500 rounded-full"><IconX className="w-3.5 h-3.5 text-white" /></button>
                  </div>
                </div>
              ))}
              <label className="aspect-video border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-yellow-600 transition-colors">
                <IconUpload className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-400">{uploading ? 'מעלה...' : 'הוסף תמונות'}</span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
            <p className="text-xs text-gray-400">{images.length} תמונות · התמונה הראשית מסומנת בכוכב זהב</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-700 text-lg mb-1">וידאו הנכס</h2>
            <p className="text-xs text-gray-400 mb-4">העלה וידאו (עד 25MB) או הדבק קישור YouTube/Vimeo</p>
            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-yellow-600 transition-colors">
                <span className="text-2xl">🎬</span>
                <span className="text-sm text-gray-500">{videoFile ? videoFile.name : 'לחץ להעלאת וידאו (MP4, MOV — עד 25MB)'}</span>
                <input type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
              </label>
              {videoPreview && <div className="relative"><video src={videoPreview} controls className="w-full rounded-xl max-h-48" /><button type="button" onClick={() => { setVideoAsPrimary(true) }} className={`absolute top-2 right-2 rounded-full p-1.5 transition-colors ${videoAsPrimary ? 'bg-yellow-500' : 'bg-black/40 hover:bg-yellow-500'}`}><IconStar className="w-4 h-4 text-white fill-white" /></button></div>}
              {form.video_url && !videoPreview && <div className="relative"><video src={form.video_url} controls className="w-full rounded-xl max-h-48" /><button type="button" onClick={() => { setVideoAsPrimary(true) }} className={`absolute top-2 right-2 rounded-full p-1.5 transition-colors ${videoAsPrimary ? 'bg-yellow-500' : 'bg-black/40 hover:bg-yellow-500'}`}><IconStar className="w-4 h-4 text-white fill-white" /></button></div>}
              <div className="flex items-center gap-2"><div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400">או</span><div className="flex-1 h-px bg-gray-200" /></div>
              <input name="video_url" value={form.video_url} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" placeholder="https://www.youtube.com/watch?v=..." dir="ltr" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-700 text-lg">פרטי הנכס</h2>
            <div className="flex gap-4">
              <div className="w-[30%]">
                <label className="block text-sm font-medium text-gray-700 mb-1">שם הנכס *</label>
                <input name="name" value={form.name} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
              </div>
              <div className="w-[70%]">
                <label className="block text-sm font-medium text-gray-700 mb-1">שם הנכס באנגלית <span className="text-gray-400 font-normal">(כתובת האתר)</span></label>
                <input name="slug" value={form.slug} onChange={handleChange} className="w-full border border-yellow-300 bg-yellow-50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600 font-mono" dir="ltr" placeholder="galil-zimmer" />
                {form.slug && <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">כתובת האתר: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-green-700">zimmer.club/{form.slug}</span></p>}
              </div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">תיאור קצר</label><input name="short_description" value={form.short_description} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">תיאור מלא</label><textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600 resize-none" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">סוג נכס</label><select name="category" value={form.category} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600">{PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">איזור</label><select name="region" value={form.region} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"><option value="">בחר איזור</option><option value="north">צפון</option><option value="galil_west">גליל המערבי</option><option value="galil_upper">גליל העליון</option><option value="galil_lower">גליל התחתון</option><option value="kinneret">כנרת</option><option value="hermon">חרמון</option><option value="center">מרכז</option><option value="jerusalem">ירושלים</option><option value="dead_sea">ים המלח</option><option value="negev">דרום</option><option value="eilat">אילת</option><option value="golan">רמת הגולן</option></select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">עיר/יישוב</label><input name="city" value={form.city} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">כתובת</label><input name="address" value={form.address} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" /></div>
            </div>
          </div>

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
                <input type="checkbox" name={checkName} id={checkName} checked={(form as any)[checkName]} onChange={handleChange} className="w-4 h-4 accent-yellow-600 shrink-0" />
                <div className="flex-1">
                  <label htmlFor={checkName} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input name={fieldName} value={(form as any)[fieldName]} onChange={handleChange} placeholder={placeholder} dir="ltr" type={type || 'text'} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-700 text-lg">תמחור וקיבולת</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">מחיר ללילה (₪)</label><input name="price_per_night" type="number" value={form.price_per_night} onChange={handleChange} min="1" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">מינימום לילות</label><input name="min_nights" type="number" value={form.min_nights} onChange={handleChange} min="1" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">מקסימום אורחים</label><input name="max_guests" type="number" value={form.max_guests} onChange={handleChange} min="1" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">חדרי שינה</label><input name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} min="0" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">חדרי רחצה</label><input name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} min="0" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" /></div>
            </div>
            <div className="flex items-center gap-2"><input type="checkbox" name="instant_book" id="instant_book" checked={form.instant_book} onChange={handleChange} className="w-4 h-4 accent-yellow-600" /><label htmlFor="instant_book" className="text-sm font-medium text-gray-700">הזמנה מיידית</label></div>
            <div className="flex items-center gap-2"><input type="checkbox" name="accepts_miluim" id="accepts_miluim" checked={form.accepts_miluim} onChange={handleChange} className="w-4 h-4 accent-yellow-600" /><label htmlFor="accepts_miluim" className="text-sm font-medium text-gray-700">מקבלים שובר מילואים</label></div>
            <div className="flex items-center gap-2"><input type="checkbox" name="has_shelter" id="has_shelter" checked={form.has_shelter} onChange={handleChange} className="w-4 h-4 accent-yellow-600" /><label htmlFor="has_shelter" className="text-sm font-medium text-gray-700">קיים מרחב מוגן</label></div>
          </div>

          {isAdmin && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-700 text-lg mb-4">סטטוס (אדמין בלבד)</h2>
              <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600">
                <option value="pending">ממתין לאישור</option><option value="active">פעיל</option><option value="inactive">לא פעיל</option><option value="rejected">נדחה</option>
              </select>
            </div>
          )}

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
                <h2 className="font-bold text-gray-700 text-lg">יחידות במתחם</h2>
                <p className="text-xs text-gray-400 mt-0.5">סוויטות, בקתות, צימרים נפרדים</p>
              </div>
              <button type="button" onClick={() => setUnits(prev => [...prev, { name: '', description: '', price_per_night: '', max_guests: '2', bedrooms: '1', bathrooms: '1', video_url: '', isNew: true }])}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-yellow-700 border border-yellow-300 hover:bg-yellow-50 transition-colors">
                <IconPlus className="w-4 h-4" />הוסף יחידה
              </button>
            </div>
            <div className="space-y-6">
              {units.filter(u => !u.toDelete).map((unit, idx) => {
                const unitId = unit.id || `new-${idx}`
                const imgs = unitImages[unitId] || []
                const isUploading = unitUploading[unitId] || false

                const handleUnitImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
                  const files = e.target.files
                  if (!files || files.length === 0 || !unit.id) return
                  setUnitUploading(prev => ({ ...prev, [unit.id!]: true }))
                  for (const file of Array.from(files)) {
                    const ext = file.name.split('.').pop()
                    const fileName = `units/${unit.id}/${Date.now()}.${ext}`
                    const { error: upErr } = await supabase.storage.from('property-images').upload(fileName, file)
                    if (!upErr) {
                      const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(fileName)
                      const { data: newImg } = await supabase.from('property_unit_images').insert({ unit_id: unit.id, url: urlData.publicUrl, order: imgs.length }).select().single()
                      if (newImg) setUnitImages(prev => ({ ...prev, [unit.id!]: [...(prev[unit.id!] || []), newImg] }))
                    }
                  }
                  setUnitUploading(prev => ({ ...prev, [unit.id!]: false }))
                  e.target.value = ''
                }

                const handleUnitImageDelete = async (imgId: string) => {
                  if (!unit.id) return
                  await supabase.from('property_unit_images').delete().eq('id', imgId)
                  setUnitImages(prev => ({ ...prev, [unit.id!]: (prev[unit.id!] || []).filter(i => i.id !== imgId) }))
                }

                return (
                  <div key={unitId} className="border border-gray-200 rounded-2xl p-5 relative">
                    <button type="button" onClick={() => setUnits(prev => prev.map((u, i) => i === idx ? { ...u, toDelete: true } : u))}
                      className="absolute top-3 left-3 p-1.5 rounded-full bg-red-50 hover:bg-red-100 transition-colors">
                      <IconX className="w-4 h-4 text-red-500" />
                    </button>
                    <p className="font-bold text-gray-700 mb-4 text-sm">יחידה {idx + 1}{unit.name ? ` — ${unit.name}` : ''}</p>

                    {/* פרטים */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">שם היחידה *</label>
                        <input value={unit.name} onChange={e => setUnits(prev => prev.map((u, i) => i === idx ? { ...u, name: e.target.value } : u))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-600" placeholder="לוסיאנה / יונן" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">מחיר ללילה (₪)</label>
                        <input type="number" value={unit.price_per_night} onChange={e => setUnits(prev => prev.map((u, i) => i === idx ? { ...u, price_per_night: e.target.value } : u))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-600" placeholder="500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">אורחים</label>
                        <input type="number" value={unit.max_guests} onChange={e => setUnits(prev => prev.map((u, i) => i === idx ? { ...u, max_guests: e.target.value } : u))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-600" min="1" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">חדרי שינה</label>
                        <input type="number" value={unit.bedrooms} onChange={e => setUnits(prev => prev.map((u, i) => i === idx ? { ...u, bedrooms: e.target.value } : u))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-600" min="0" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">חדרי רחצה</label>
                        <input type="number" value={unit.bathrooms} onChange={e => setUnits(prev => prev.map((u, i) => i === idx ? { ...u, bathrooms: e.target.value } : u))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-600" min="0" />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-600 mb-1">תיאור</label>
                      <textarea value={unit.description} onChange={e => setUnits(prev => prev.map((u, i) => i === idx ? { ...u, description: e.target.value } : u))}
                        rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-600 resize-none" placeholder="תיאור קצר של היחידה..." />
                    </div>

                    {/* גלריה */}
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-600 mb-2">גלריית תמונות</label>
                      {!unit.id && <p className="text-xs text-amber-600 mb-2">שמור את הנכס תחילה כדי להעלות תמונות ליחידה חדשה</p>}
                      <div className="grid grid-cols-4 gap-2">
                        {imgs.map(img => (
                          <div key={img.id} className="relative group aspect-video">
                            <img src={img.url} alt="" className="w-full h-full object-cover rounded-lg" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <button type="button" onClick={() => handleUnitImageDelete(img.id)} className="p-1.5 bg-red-500 rounded-full">
                                <IconX className="w-3 h-3 text-white" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {unit.id && (
                          <label className="aspect-video border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-yellow-600 transition-colors">
                            <IconUpload className="w-5 h-5 text-gray-300 mb-1" />
                            <span className="text-xs text-gray-400">{isUploading ? 'מעלה...' : 'הוסף'}</span>
                            <input type="file" accept="image/*" multiple onChange={handleUnitImageUpload} className="hidden" disabled={isUploading} />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* וידאו */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">קישור וידאו (YouTube/Vimeo)</label>
                      <input value={unit.video_url} onChange={e => setUnits(prev => prev.map((u, i) => i === idx ? { ...u, video_url: e.target.value } : u))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-yellow-600"
                        placeholder="https://www.youtube.com/watch?v=..." dir="ltr" />
                    </div>
                  </div>
                )
              })}
              {units.filter(u => !u.toDelete).length === 0 && (
                <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">
                  אין יחידות — לחץ "הוסף יחידה" להוספה
                </div>
              )}
            </div>
          </div>

          {form.slug && <PropertyQR slug={form.slug} name={form.name} mode="edit" />}
          {isAdmin && <AdminReviews propertyId={params.id as string} />}
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">הנכס עודכן בהצלחה!</div>}

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl font-bold text-white text-sm" style={{ backgroundColor: '#8B6914' }}>{saving ? 'שומר...' : 'שמור שינויים'}</button>
            <button type="button" onClick={async () => { if(confirm('למחוק את הנכס לצמיתות?')) { await supabase.from('properties').delete().eq('id', params.id); router.push('/dashboard/owner') } }} className="px-6 py-3 rounded-xl font-bold text-red-600 text-sm border border-red-200 hover:bg-red-50">מחק נכס</button>
            <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-xl font-bold text-gray-700 text-sm border border-gray-200 hover:bg-gray-50">ביטול</button>
          </div>
        </form>
      </div>
    </div>
  )
}
