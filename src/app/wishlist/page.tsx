'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useWishlist } from '@/hooks/useWishlist'
import { IconSearch, IconMapPin, IconBed, IconUsers, IconHeart, IconTrash, IconArrowRight } from '@/components/icons'

type Item = {
  id: string; type: 'property' | 'caravan' | 'attraction'
  name: string; city: string; region?: string
  price: number; slug?: string
  img?: string
  bedrooms?: number; max_guests?: number
  category?: string[]
}

const TYPE_LABELS: Record<string, string> = { property: 'צימר / וילה', caravan: 'קרוואן', attraction: 'אטרקציה' }

export default function WishlistPage() {
  const { likedKeys, toggle, isLiked } = useWishlist()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'property' | 'caravan' | 'attraction'>('all')
  const supabase = createClient()
  const router = useRouter()

  const propertyIds = likedKeys.filter(k => k.startsWith('property:')).map(k => k.replace('property:', ''))
  const caravanIds = likedKeys.filter(k => k.startsWith('caravan:')).map(k => k.replace('caravan:', ''))
  const attractionIds = likedKeys.filter(k => k.startsWith('attraction:')).map(k => k.replace('attraction:', ''))

  useEffect(() => {
    async function load() {
      if (likedKeys.length === 0) { setLoading(false); return }
      const results: Item[] = []

      // Properties
      if (propertyIds.length > 0) {
        const { data: props } = await supabase
          .from('properties')
          .select('id, slug, name, city, region, price_per_night, bedrooms, max_guests, category')
          .in('id', propertyIds)
        const { data: imgs } = await supabase
          .from('property_images').select('property_id, url').in('property_id', propertyIds).order('order')
        const imgMap: Record<string, string> = {}
        imgs?.forEach((img: any) => { if (!imgMap[img.property_id]) imgMap[img.property_id] = img.url })
        props?.forEach((p: any) => results.push({
          id: p.id, type: 'property', name: p.name, city: p.city, region: p.region,
          price: p.price_per_night, slug: p.slug, img: imgMap[p.id],
          bedrooms: p.bedrooms, max_guests: p.max_guests, category: p.category,
        }))
      }

      // Caravans
      if (caravanIds.length > 0) {
        const { data: cars } = await supabase
          .from('caravans').select('id, slug, name, city, price_per_night, caravan_images(url)').in('id', caravanIds)
        cars?.forEach((c: any) => results.push({
          id: c.id, type: 'caravan', name: c.name, city: c.city,
          price: c.price_per_night, slug: c.slug, img: c.caravan_images?.[0]?.url,
        }))
      }

      // Attractions
      if (attractionIds.length > 0) {
        const { data: attrs } = await supabase
          .from('attractions').select('id, slug, name, city, price_per_person, attraction_images(url)').in('id', attractionIds)
        attrs?.forEach((a: any) => results.push({
          id: a.id, type: 'attraction', name: a.name, city: a.city,
          price: a.price_per_person, slug: a.slug, img: a.attraction_images?.[0]?.url,
        }))
      }

      setItems(results)
      setLoading(false)
    }
    load()
  }, [likedKeys.join(',')])

  const getHref = (item: Item) => {
    if (item.type === 'caravan') return `/caravans/${item.slug || item.id}`
    if (item.type === 'attraction') return `/attractions/${item.slug || item.id}`
    return item.slug ? `/properties/${item.slug}` : `/property/${item.id}`
  }

  const displayed = filter === 'all' ? items : items.filter(i => i.type === filter)

  const counts = {
    all: likedKeys.length,
    property: propertyIds.length,
    caravan: caravanIds.length,
    attraction: attractionIds.length,
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-4" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-8">

        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
          <IconArrowRight className="w-4 h-4" />
          חזרה
        </button>

        <div className="flex items-center gap-3 mb-6">
          <IconHeart className="w-6 h-6 fill-red-500 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900">המועדפים שלי</h1>
          {likedKeys.length > 0 && (
            <span className="bg-red-100 text-red-600 text-sm font-bold px-3 py-0.5 rounded-full">{likedKeys.length}</span>
          )}
        </div>

        {likedKeys.length > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {(['all', 'property', 'caravan', 'attraction'] as const).map(t => (
              <button key={t} onClick={() => setFilter(t)}
                className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
                style={{
                  background: filter === t ? '#8B6914' : '#fff',
                  color: filter === t ? '#fff' : '#6b7280',
                  borderColor: filter === t ? '#8B6914' : '#e5e7eb',
                }}>
                {t === 'all' ? `הכל (${counts.all})` : `${TYPE_LABELS[t]} (${counts[t]})`}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400">טוען...</div>
        ) : likedKeys.length === 0 ? (
          <div className="text-center py-20">
            <IconHeart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">עוד לא הוספת נכסים למועדפים</p>
            <p className="text-gray-400 text-sm mb-6">לחץ על הלב בכל נכס כדי לשמור אותו כאן</p>
            <Link href="/search"
              className="inline-block px-6 py-3 rounded-xl text-white font-bold text-sm transition-colors"
              style={{ backgroundColor: '#8B6914' }}>
              חפש נכסים
            </Link>
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 text-gray-400">אין פריטים בקטגוריה זו</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.map(item => (
              <div key={`${item.type}-${item.id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  {item.img ? (
                    <Image src={item.img} alt={item.name} fill sizes="(max-width:640px) 100vw,33vw" className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-sm">
                      {item.type === 'caravan' ? '🚐' : item.type === 'attraction' ? '🎯' : '🏡'}
                    </div>
                  )}
                  <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-amber-700">
                    {TYPE_LABELS[item.type]}
                  </span>
                  <button
                    onClick={() => toggle(item.id, item.type)}
                    className="absolute top-3 left-3 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all hover:scale-110"
                    aria-label="הסר מהמועדפים"
                  >
                    <IconTrash className="w-4 h-4 text-red-500" />
                  </button>
                </div>
                <Link href={getHref(item)} className="block p-4">
                  <h2 className="font-bold text-gray-900 mb-2 truncate">{item.name}</h2>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><IconMapPin className="w-3 h-3" />{item.city}</span>
                    {item.bedrooms && <span className="flex items-center gap-1"><IconBed className="w-3 h-3" />{item.bedrooms} חד׳</span>}
                    {item.max_guests && <span className="flex items-center gap-1"><IconUsers className="w-3 h-3" />עד {item.max_guests}</span>}
                  </div>
                  {item.price > 0 ? (
                    <p className="font-bold text-gray-900">
                      ₪{item.price}
                      <span className="font-normal text-xs text-gray-400 mr-1">/ {item.type === 'attraction' ? 'אדם' : 'לילה'}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">מחיר בתיאום</p>
                  )}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
