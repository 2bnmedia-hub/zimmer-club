import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('properties')
    .select('id, name, short_description, description, city, slug')
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .single()

  if (!data) return {}

  const { data: imgData } = await supabase
    .from('property_images')
    .select('url')
    .eq('property_id', data.id)
    .order('order')
    .limit(1)

  const imageUrl = imgData?.[0]?.url || 'https://www.zimmer.club/og-image.png'
  const title = `${data.name} — צימר ב${data.city || 'ישראל'}`
  const description = data.short_description || data.description?.slice(0, 160) || 'צימר יוקרה בישראל'
  const canonical = `https://www.zimmer.club/properties/${data.slug || data.id}`

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

export default async function PropertyLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: property } = await supabase
    .from('properties')
    .select('id, name, description, short_description, city, price_per_night, avg_rating, total_reviews, slug')
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .single()

  if (!property) return <>{children}</>

  const { data: imgData } = await supabase
    .from('property_images')
    .select('url')
    .eq('property_id', property.id)
    .order('order')
    .limit(1)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: property.name,
    description: property.short_description || property.description?.slice(0, 200) || '',
    image: imgData?.[0]?.url || 'https://www.zimmer.club/logo.png',
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.city || '',
      addressCountry: 'IL',
    },
    priceRange: property.price_per_night ? `₪${property.price_per_night}` : '',
    ...(property.avg_rating > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: property.avg_rating,
        reviewCount: property.total_reviews,
      },
    }),
    url: `https://www.zimmer.club/properties/${property.slug || property.id}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
