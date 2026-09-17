import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('caravans')
    .select('id, name, short_description, description, city, slug')
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .single()

  if (!data) return {}

  const { data: imgData } = await supabase
    .from('caravan_images')
    .select('url')
    .eq('caravan_id', data.id)
    .order('order')
    .limit(1)

  const imageUrl = imgData?.[0]?.url || 'https://www.zimmer.club/og-image.png'
  const title = `${data.name} — קרוואן ב${data.city || 'ישראל'}`
  const description = data.short_description || data.description?.slice(0, 160) || 'קרוואן להשכרה בישראל'
  const canonical = `https://www.zimmer.club/caravans/${data.slug || data.id}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      locale: 'he_IL',
      siteName: 'zimmer.club',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default function CaravanLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
