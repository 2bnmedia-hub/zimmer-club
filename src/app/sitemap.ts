import { createClient } from '@/lib/supabase/server'

export default async function sitemap() {
  const baseUrl = 'https://www.zimmer.club'

  const staticPages = [
    { url: baseUrl,                        lastModified: new Date(), changeFrequency: 'daily'  as const, priority: 1.0 },
    { url: `${baseUrl}/search`,            lastModified: new Date(), changeFrequency: 'daily'  as const, priority: 0.9 },
    { url: `${baseUrl}/deals`,             lastModified: new Date(), changeFrequency: 'daily'  as const, priority: 0.8 },
    { url: `${baseUrl}/attractions`,       lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/hotels`,            lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/camping`,           lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${baseUrl}/caravans`,          lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${baseUrl}/guide`,             lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/find`,              lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/about`,             lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/advertise`,         lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
  ]

  try {
    const supabase = await createClient()

    const [{ data: properties }, { data: caravans }, { data: attractions }] = await Promise.all([
      supabase.from('properties').select('slug, updated_at').eq('status', 'active').not('slug', 'is', null),
      supabase.from('caravans').select('slug, updated_at').eq('status', 'active').not('slug', 'is', null),
      supabase.from('attractions').select('slug, updated_at').eq('status', 'active').not('slug', 'is', null),
    ])

    const propertyPages = (properties || []).map((p) => ({
      url: `${baseUrl}/properties/${p.slug}`,
      lastModified: new Date(p.updated_at || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    const caravanPages = (caravans || []).map((c) => ({
      url: `${baseUrl}/caravans/${c.slug}`,
      lastModified: new Date(c.updated_at || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    const attractionPages = (attractions || []).map((a) => ({
      url: `${baseUrl}/attractions/${a.slug}`,
      lastModified: new Date(a.updated_at || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...propertyPages, ...caravanPages, ...attractionPages]
  } catch {
    return staticPages
  }
}
