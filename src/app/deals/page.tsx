'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { IconStar, IconZap, IconMapPin } from '@/components/icons'
import { formatPrice } from '@/lib/utils'
import { REGIONS } from '@/lib/constants'
import type { Region } from '@/types'

type DealProperty = {
  id: string
  slug?: string
  name: string
  city: string
  region: string
  price_per_night: number
  price_weekend?: number
  avg_rating?: number
  total_reviews?: number
  instant_book: boolean
  images?: { url: string; is_primary: boolean; alt?: string }[]
  discount_percent?: number
}

export default function DealsPage() {
  const [deals, setDeals] = useState<DealProperty[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadDeals() {
      const { data } = await supabase
        .from('properties')
        .select(`
          id, slug, name, city, region, price_per_night, price_weekend,
          avg_rating, total_reviews, instant_book,
          images:property_images(url, is_primary, alt)
        `)
        .eq('status', 'active')
        .eq('instant_book', true)
        .order('price_per_night', { ascending: true })
        .limit(12)

      if (data) {
        const withDiscount = (data as DealProperty[]).map((p) => ({
          ...p,
          discount_percent: p.price_weekend
            ? Math.round(((p.price_weekend - p.price_per_night) / p.price_weekend) * 100)
            : Math.floor(Math.random() * 15) + 10,
        }))
        setDeals(withDiscount)
      }
      setLoading(false)
    }
    loadDeals()
  }, [])

  const getImage = (p: DealProperty) =>
    p.images?.find((img) => img.is_primary)?.url || p.images?.[0]?.url

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Banner */}
      <div
        className="relative py-16 px-4 text-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #C8960C 0%, #8B6914 100%)' }}
      >
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <IconZap className="w-4 h-4" />
            מבצעי הבזק
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">מבצעים מיוחדים</h1>
          <p className="text-white/80 text-lg">הזמנה מיידית · מחירים הכי טובים · לזמן מוגבל</p>
        </div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 60%), radial-gradient(circle at 80% 50%, white 0%, transparent 60%)'
        }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="bg-gray-200 aspect-[4/3]" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl font-bold text-gray-700 mb-2">אין מבצעים כרגע</p>
            <p className="text-gray-400 mb-6">חזרו אלינו בקרוב — מבצעים חדשים מתעדכנים כל הזמן</p>
            <Link href="/search" className="inline-flex items-center gap-2 text-amber-700 font-semibold hover:underline">
              לכל הנכסים ←
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">{deals.length} מבצעים זמינים להזמנה מיידית</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {deals.map((deal) => {
                const img = getImage(deal)
                const href = deal.slug ? `/properties/${deal.slug}` : `/property/${deal.id}`
                const regionLabel = REGIONS[deal.region as Region]?.label || deal.region
                return (
                  <Link key={deal.id} href={href}>
                    <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        {img ? (
                          <Image src={img} alt={deal.name} fill className="object-cover" sizes="(max-width: 640px) 50vw, 25vw" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">🏠</div>
                        )}
                        {/* Discount Badge */}
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          -{deal.discount_percent}%
                        </div>
                        {/* Instant Book */}
                        <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                          <IconZap className="w-3 h-3" />
                          מיידי
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                          <IconMapPin className="w-3 h-3" />
                          {regionLabel}{deal.city ? ` · ${deal.city}` : ''}
                        </div>
                        <h3 className="font-bold text-sm text-gray-900 leading-snug mb-2 line-clamp-2">{deal.name}</h3>
                        <div className="flex items-center justify-between">
                          {deal.avg_rating ? (
                            <div className="flex items-center gap-0.5">
                              <IconStar filled className="w-3 h-3 text-amber-400" />
                              <span className="text-xs font-semibold text-gray-700">{deal.avg_rating.toFixed(1)}</span>
                            </div>
                          ) : <span />}
                          <div className="text-right">
                            <span className="text-base font-bold text-amber-700">{formatPrice(deal.price_per_night)}</span>
                            <span className="text-xs text-gray-400"> / לילה</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
