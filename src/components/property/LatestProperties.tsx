'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { IconSearch, IconMapPin, IconCalendar, IconUsers, IconHome, IconChevronDown, IconChevronUp, IconChevronLeft, IconChevronRight, IconStar, IconHeart, IconUser, IconPhone, IconGlobe, IconNavigation, IconArrowRight, IconZap, IconEye, IconEyeOff, IconUpload, IconTrash, IconEdit, IconPlus, IconCheck, IconMail, IconSend, IconRefresh, IconSparkles, IconBed, IconBath, IconTrendingUp, IconLoader, IconCamera, IconSave, IconAlertCircle, IconCheckCircle, IconClock, IconSliders, IconPencil, IconQr, IconShare, IconDownload, IconZoomIn, IconZoomOut, IconLogOut, IconSettings, IconMenu, IconX } from '@/components/icons'

type Property = {
  slug?: string
  id: string
  name: string
  short_description: string
  category: string[]
  region: string
  city: string
  price_per_night: number
  max_guests: number
  avg_rating: number
  instant_book: boolean
  property_images: { url: string }[]
}

export function LatestProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('properties')
        .select('*, property_images(url, "order")')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(4)
      setProperties(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading || properties.length === 0) return null

  return (
    <section className="section-padding bg-white !pt-8">
      <div className="page-container !max-w-[90rem] !px-2">
        <div className="flex items-end justify-between mb-6">
          <div>
                        <h2 className="section-title" style={{color: "#8B4513"}}>לקוחות ממש אהבו</h2>
          </div>
          <Link href="/search" className="text-sm font-semibold text-gold-deep hover:underline hidden sm:block">
            כל הנכסים ←
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {properties.map((p) => {
            const firstImage = p.property_images?.[0]?.url
            return (
              <Link key={p.id} href={`/${p.slug || p.id}`}
                className="group bg-white rounded-xl overflow-hidden border border-sand-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-[3/2] bg-gray-100 relative overflow-hidden">
                  {firstImage ? (
                    <Image src={firstImage} alt={p.name} fill sizes="(max-width:640px) 50vw,(max-width:1024px) 25vw,25vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">אין תמונה</div>
                  )}
                  {p.instant_book && (
                    <div className="absolute top-3 right-3">
                      <span style={{background: "linear-gradient(135deg, #f5d078 0%, #d4a843 40%, #b8860b 100%)", boxShadow: "0 2px 8px rgba(212,168,67,0.6), 0 1px 3px rgba(0,0,0,0.2)"}} className="text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <IconZap className="w-3 h-3" />מיידי
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-charcoal text-base group-hover:text-gold-deep transition-colors line-clamp-1">{p.name}</h3>
                    {p.avg_rating > 0 && (
                      <div className="flex items-center gap-0.5 shrink-0">
                        <IconStar className="w-4 h-4 fill-gold text-gold" />
                        <span className="text-sm text-taupe">{p.avg_rating}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-taupe mb-2.5">{p.city || ({north:"צפון",galil_west:"גליל המערבי",galil_upper:"גליל העליון",galil_lower:"גליל התחתון",kinneret:"כנרת",hermon:"חרמון",center:"מרכז",jerusalem:"ירושלים",dead_sea:"ים המלח",negev:"דרום",eilat:"אילת",golan:"רמת הגולן"} as Record<string,string>)[p.region]}</p>
                  {p.short_description && <p className="text-sm text-taupe/70 mb-3.5 line-clamp-2">{p.short_description}</p>}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-charcoal text-base">החל מ: ₪{p.price_per_night}</span>
                      <span className="text-sm text-taupe"> / לילה</span>
                    </div>
                    <span className="text-sm text-taupe">עד {p.max_guests} אורחים</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
