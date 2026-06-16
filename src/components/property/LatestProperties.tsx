'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

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
  reviews?: { id: string }[]
  accepts_miluim?: boolean
  has_shelter?: boolean
}

export function LatestProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: featured } = await supabase
        .from('homepage_featured')
        .select('item_id, slot')
        .eq('section', 'latest')
        .eq('item_type', 'property')
        .order('slot')

      if (featured && featured.length > 0) {
        const ids = featured.map((f: any) => f.item_id)
        const { data } = await supabase
          .from('properties')
          .select('*, property_images(url, "order"), reviews(id), accepts_miluim, has_shelter')
          .in('id', ids)
        const sorted = featured
          .map((f: any) => data?.find((p: any) => p.id === f.item_id))
          .filter(Boolean) as Property[]
        setProperties(sorted)
      } else {
        const { data } = await supabase
          .from('properties')
          .select('*, property_images(url, "order"), reviews(id), accepts_miluim, has_shelter')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(5)
        setProperties(data || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading || properties.length === 0) return null

  const [main, ...rest] = properties
  const mainImg = main?.property_images?.[0]?.url
  const getImg = (p: Property) => p.property_images?.[0]?.url

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="section-title shimmer-text" style={{ fontSize: '170%' }}>הנכסים הנצפים ביותר</h2>
          </div>
          <Link href="/search" className="text-sm font-medium hover:underline" style={{ color: '#8B6914' }}>כל הנכסים ←</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {main && (
            <Link href={`/${main.slug || main.id}`}
              className="group relative rounded-3xl overflow-hidden cursor-pointer lg:col-span-2 lg:row-span-2"
              style={{ minHeight: '420px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
              {mainImg ? (
                <Image src={mainImg} alt={main.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-6xl">🏡</div>
              )}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }} />
              {main.instant_book && (
                <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full text-white"
                  style={{ background: 'linear-gradient(135deg, #C8960C, #8B6914)' }}>הזמנה מיידית</span>
              )}
              <div className="absolute bottom-0 right-0 left-0 p-6 text-white">
                <p className="text-xs text-white/60 mb-1">📍 {main.city}</p>
                <h3 className="font-bold text-xl mb-1">{main.name}</h3>
                <p className="text-sm text-white/70 mb-3 line-clamp-2">{main.short_description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm">עד {main.max_guests} אורחים</p>
                  <p className="font-bold" style={{ color: '#F5C842' }}>₪{main.price_per_night?.toLocaleString()} / לילה</p>
                </div>
              </div>
            </Link>
          )}

          {rest.slice(0, 4).map((p) => {
            const img = getImg(p)
            return (
              <Link key={p.id} href={`/${p.slug || p.id}`}
                className="group relative rounded-3xl overflow-hidden cursor-pointer"
                style={{ minHeight: '200px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                {img ? (
                  <Image src={img} alt={p.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-4xl">🏡</div>
                )}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)' }} />
                <div className="absolute bottom-0 right-0 left-0 p-4 text-white">
                  <p className="text-xs text-white/60 mb-0.5">📍 {p.city}</p>
                  <h3 className="font-bold text-sm mb-1">{p.name}</h3>
                  <p className="font-bold text-xs" style={{ color: '#F5C842' }}>₪{p.price_per_night?.toLocaleString()} / לילה</p>
                </div>
                {p.instant_book && (
                  <span className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: 'linear-gradient(135deg, #C8960C, #8B6914)' }}>מיידי</span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
