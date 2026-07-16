import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const baseUrl = 'https://zimmer.club'

  try {
    const supabase = await createClient()

    let { data } = await supabase
      .from('properties')
      .select('id, slug, name, short_description, description, city, region, price_per_night')
      .eq('slug', slug)
      .single()

    if (!data) {
      const res = await supabase
        .from('properties')
        .select('id, slug, name, short_description, description, city, region, price_per_night')
        .eq('id', slug)
        .single()
      data = res.data
    }

    if (!data) return { title: 'נכס לא נמצא | zimmer.club' }

    const { data: imgData } = await supabase
      .from('property_images')
      .select('url')
      .eq('property_id', data.id)
      .order('order')
      .limit(1)
      .single()

    const title = `${data.name}${data.city ? ` — ${data.city}` : ''} | zimmer.club`
    const description = data.short_description || data.description?.slice(0, 155) ||
      `${data.name} — צימר ב${data.city || 'ישראל'}. החל מ-₪${data.price_per_night} ללילה. הזמנה מיידית באתר zimmer.club`
    const canonical = `${baseUrl}/properties/${data.slug || data.id}`
    const image = imgData?.url

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
        ...(image && { images: [{ url: image, width: 1200, height: 630, alt: data.name }] }),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        ...(image && { images: [image] }),
      },
    }
  } catch {
    return { title: 'zimmer.club — צימרים ווילות יוקרה בישראל' }
  }
}

export default function PropertyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
