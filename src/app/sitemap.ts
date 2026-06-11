import { createClient } from '@/lib/supabase/client'

export default async function sitemap() {
  const baseUrl = 'https://zimmer.club'

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/attractions`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ]

  try {
    const supabase = createClient()
    const { data: properties } = await supabase
      .from('properties')
      .select('slug, updated_at')
      .eq('status', 'active')
      .not('slug', 'is', null)

    const propertyPages = (properties || []).map((p) => ({
      url: `${baseUrl}/${p.slug}`,
      lastModified: new Date(p.updated_at || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...propertyPages]
  } catch {
    return staticPages
  }
}
