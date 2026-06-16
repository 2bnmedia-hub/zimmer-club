'use client'

import Image from 'next/image'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useWishlist } from '@/hooks/useWishlist'
import { IconSearch, IconMapPin, IconCalendar, IconUsers, IconHome, IconChevronDown, IconChevronUp, IconChevronLeft, IconChevronRight, IconStar, IconHeart, IconUser, IconPhone, IconGlobe, IconNavigation, IconArrowRight, IconZap, IconEye, IconEyeOff, IconUpload, IconTrash, IconEdit, IconPlus, IconCheck, IconMail, IconSend, IconRefresh, IconSparkles, IconBed, IconBath, IconTrendingUp, IconLoader, IconCamera, IconSave, IconAlertCircle, IconCheckCircle, IconClock, IconSliders, IconPencil, IconQr, IconShare, IconDownload, IconZoomIn, IconZoomOut, IconLogOut, IconSettings, IconMenu, IconX } from '@/components/icons'

type Property = {
  slug?: string
  id: string
  name: string
  city: string
  region: string
  price_per_night: number
  bedrooms: number
  max_guests: number
  category: string[]
}

export default function WishlistPage() {
  const { likedIds, toggle } = useWishlist()
  const [properties, setProperties] = useState<Property[]>([])
  const [images, setImages] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      if (likedIds.length === 0) { setLoading(false); return }

      const { data } = await supabase
        .from('properties')
        .select('id, name, city, region, price_per_night, bedrooms, max_guests, category')
        .in('id', likedIds)

      setProperties(data || [])

      // תמונה ראשית לכל נכס
      const { data: imgData } = await supabase
        .from('property_images')
        .select('property_id, url')
        .in('property_id', likedIds)
        .order('order')

      const imgMap: Record<string, string> = {}
      imgData?.forEach((img: any) => {
        if (!imgMap[img.property_id]) imgMap[img.property_id] = img.url
      })
      setImages(imgMap)
      setLoading(false)
    }
    load()
  }, [likedIds.length])

  return (
    <>
      <main className="min-h-screen bg-gray-50 pt-4" dir="rtl">
        <div className="max-w-6xl mx-auto px-4 py-8">

          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
            <IconArrowRight className="w-4 h-4" />
            חזרה
          </button>

          <div className="flex items-center gap-3 mb-8">
            <IconHeart className="w-6 h-6 fill-red-500 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">המועדפים שלי</h1>
            {likedIds.length > 0 && (
              <span className="bg-red-100 text-red-600 text-sm font-bold px-3 py-0.5 rounded-full">
                {likedIds.length}
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400">טוען...</div>
          ) : likedIds.length === 0 ? (
            <div className="text-center py-20">
              <IconHeart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">עוד לא הוספת נכסים למועדפים</p>
              <p className="text-gray-400 text-sm mb-6">לחץ על הלב בדף הנכס כדי לשמור אותו כאן</p>
              <Link href="/search"
                className="inline-block px-6 py-3 rounded-xl text-white font-bold text-sm transition-colors"
                style={{ backgroundColor: '#8B6914' }}>
                חפש נכסים
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(p => (
                <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="relative h-48">
                    {images[p.id] ? (
                      <Image src={images[p.id]} alt={p.name} fill sizes="(max-width:640px) 100vw,33vw" className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-sm">אין תמונה</div>
                    )}
                    <button
                      onClick={() => toggle(p.id)}
                      className="absolute top-3 left-3 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all hover:scale-110"
                      aria-label="הסר מהמועדפים"
                    >
                      <IconTrash className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  <Link href={`/${p.slug || p.id}`} className="block p-4">
                    <p className="text-xs text-gray-400 mb-1">{p.category?.[0]}</p>
                    <h2 className="font-bold text-gray-900 mb-2 truncate">{p.name}</h2>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><IconMapPin className="w-3 h-3" />{p.city}</span>
                      <span className="flex items-center gap-1"><IconBed className="w-3 h-3" />{p.bedrooms} חד׳</span>
                      <span className="flex items-center gap-1"><IconUsers className="w-3 h-3" />עד {p.max_guests}</span>
                    </div>
                    {p.price_per_night > 0 ? <p className="font-bold text-gray-900">החל מ ₪{p.price_per_night} <span className="font-normal text-xs text-gray-400">/ לילה</span></p> : <p className="text-sm text-gray-400">מחיר בתיאום</p>}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
