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
      const { data } = await supabase
        .from('properties')
        .select('*, property_images(url, "order"), reviews(id), accepts_miluim, has_shelter')
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
            <h2 className="section-title shimmer-text" style={{fontSize: "170%"}}>הצימרים הנצפים ביותר</h2>
          </div>
          <Link href="/search" className="text-sm font-semibold text-gold-deep hover:underline hidden sm:block">
            כל הנכסים ←
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {properties.map((p) => {
            const firstImage = p.property_images?.[0]?.url
            const reviewCount = p.reviews?.length || 0
            const rating = p.avg_rating || 0
            return (
              <div key={p.id} className="group bg-white rounded-xl overflow-hidden border border-sand-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
                <Link href={`/${p.slug || p.id}`} className="block">
                  <div className="aspect-[3/2] bg-gray-100 relative overflow-hidden">
                    {firstImage ? (
                      <Image src={firstImage} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🏡</div>
                    )}
                    {p.instant_book && (
                      <span className="absolute top-2 right-2 text-xs font-bold text-white px-2 py-1 rounded-lg shadow-md"
                        style={{ background: 'linear-gradient(135deg, #f5d078 0%, #d4a843 40%, #b8860b 100%)', boxShadow: '0 2px 8px rgba(184,134,11,0.4)' }}>
                        מיידי
                      </span>
                    )}
                  </div>
                </Link>
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 leading-tight text-base">{p.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{p.city}</p>
                  <div className="flex items-center gap-1 mb-3">
                    {[1,2,3,4,5].map(i => (
                      <span key={i} className={`text-sm ${i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                    ))}
                    <span className="text-xs text-gray-400 mr-1">{reviewCount} חוות דעת</span>
                  </div>
                  <div className="flex items-center gap-1 mb-3 flex-wrap">
                    {p.accepts_miluim && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#faf7ed] text-gray-700 border border-[#edeadf]">מקבלים מילואים</span>
                    )}
                    {p.has_shelter && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#faf7ed] text-gray-700 border border-[#edeadf]">מרחב מוגן</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-800">
                    עד {p.max_guests} אורחים
                  </p>
                  <p className="text-sm font-bold mt-1" style={{ color: '#8B6914' }}>
                    החל מ: {p.price_per_night?.toLocaleString()}₪ / לילה
                  </p>
                  <div className="flex gap-2 mt-auto pt-3">
                    <a href={`https://wa.me/?text=${encodeURIComponent(p.name)}`}
                      className="flex-1 text-center text-xs py-2 rounded-lg bg-green-50 text-green-700 font-medium hover:bg-green-100 transition-colors">
                      WhatsApp 💬
                    </a>
                    <Link href={`/${p.slug || p.id}`}
                      className="flex-1 text-center text-xs py-2 rounded-lg bg-gray-50 text-gray-700 font-medium hover:bg-gray-100 transition-colors">
                      התקשר 📞
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
