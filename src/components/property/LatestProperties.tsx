'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Star, Zap } from 'lucide-react'
import { REGIONS } from '@/lib/constants'

type Property = {
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
    <section className="section-padding bg-white">
      <div className="page-container">
        <div className="flex items-end justify-between mb-10">
          <div>
                        <h2 className="section-title">לקוחות ממש אהבו</h2>
          </div>
          <Link href="/search" className="text-sm font-semibold text-gold-deep hover:underline hidden sm:block">
            כל הנכסים ←
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties.map((p) => {
            const firstImage = p.property_images?.[0]?.url
            return (
              <Link key={p.id} href={`/${p.slug || p.id}`}
                className="group bg-white rounded-2xl overflow-hidden border border-sand-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  {firstImage ? (
                    <img src={firstImage} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">אין תמונה</div>
                  )}
                  {p.instant_book && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-white text-yellow-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Zap className="w-3 h-3" />מיידי
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-charcoal text-sm group-hover:text-gold-deep transition-colors line-clamp-1">{p.name}</h3>
                    {p.avg_rating > 0 && (
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Star className="w-3 h-3 fill-gold text-gold" />
                        <span className="text-xs text-taupe">{p.avg_rating}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-taupe mb-2">{p.city || REGIONS[p.region as keyof typeof REGIONS]?.label}</p>
                  {p.short_description && <p className="text-xs text-taupe/70 mb-3 line-clamp-2">{p.short_description}</p>}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-charcoal text-sm">החל מ: ₪{p.price_per_night}</span>
                      <span className="text-xs text-taupe"> / לילה</span>
                    </div>
                    <span className="text-xs text-taupe">עד {p.max_guests} אורחים</span>
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
