'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { IconStar, IconHeart, IconMapPin, IconZap } from '@/components/icons'
import { cn, formatPrice, truncate } from '@/lib/utils'
import type { Property } from '@/types'
import { REGIONS } from '@/lib/constants'

interface PropertyCardProps {
  property: Property
  className?: string
}

export function PropertyCard({ property, className }: PropertyCardProps) {
  const [isFaved, setIsFaved] = useState(false)

  const primaryImage = property.images?.find((img) => img.is_primary) || property.images?.[0]
  const region = REGIONS[property.region]

  return (
    <Link href={property.slug ? `/properties/${property.slug}` : `/property/${property.id}`}>
      <article
        dir="rtl"
        className={cn(
          'card group cursor-pointer overflow-hidden transition-all duration-300',
          'hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(61,47,32,0.10)]',
          className
        )}
      >
        {/* תמונה — גובה רספונסיבי במקום קשיח */}
        <div className="relative overflow-hidden bg-sand-100" style={{ aspectRatio: '4/3' }}>
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || property.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-sand-100 to-sand-200 flex items-center justify-center text-5xl opacity-40">
              🏠
            </div>
          )}

          {/* תגיות */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
            {property.instant_book && (
              <span className="badge badge-gold flex items-center gap-1">
                <IconZap className="w-3 h-3" />
                <span className="hidden sm:inline">הזמנה </span>מיידית
              </span>
            )}
            {property.category?.includes('luxury') && (
              <span className="badge bg-espresso/90 text-cream-50 text-xs px-2.5 py-0.5">
                יוקרה
              </span>
            )}
          </div>

          {/* מועדפים */}
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsFaved(!isFaved)
            }}
            className="absolute top-3 left-3 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            aria-label={isFaved ? 'הסר ממועדפים' : 'הוסף למועדפים'}
          >
            <IconHeart
              filled={isFaved}
              className={cn('w-4 h-4 sm:w-5 sm:h-5 transition-colors', isFaved ? 'text-red-500' : 'text-taupe')}
            />
          </button>
        </div>

        {/* תוכן */}
        <div className="p-3 sm:p-5">
          {/* מיקום */}
          <div className="flex items-center gap-1 text-xs sm:text-sm font-semibold uppercase tracking-wider text-taupe mb-2 text-right">
            <IconMapPin className="w-3 h-3 flex-shrink-0" />
            {region?.label}{property.city ? ` • ${property.city}` : ''}
          </div>

          {/* שם */}
          <h3 className="font-bold text-base sm:text-xl text-charcoal leading-snug mb-2 sm:mb-3 text-right">
            {truncate(property.name, 40)}
          </h3>

          {/* תגיות שירות */}
          <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2 sm:mb-3.5 justify-end">
            {property.amenities?.slice(0, 3).map((amenity) => (
              <span
                key={amenity.key}
                className="text-xs sm:text-sm font-medium text-taupe bg-cream-100 border border-sand-100 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full"
              >
                {amenity.label_he}
              </span>
            ))}
          </div>

          {/* Footer: דירוג + מחיר */}
          <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-sand-100">
            <div className="flex items-center gap-1">
              <IconStar filled className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-sm sm:text-base font-bold text-charcoal">
                {property.avg_rating?.toFixed(1) || '—'}
              </span>
              {property.total_reviews ? (
                <span className="text-xs text-taupe">({property.total_reviews})</span>
              ) : null}
            </div>

            <div className="text-right">
              {property.price_weekend ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-taupe">אמצ"ש:</span>
                  <span className="text-sm font-bold text-charcoal">{formatPrice(property.price_per_night)}</span>
                  <span className="text-xs text-amber-600 font-semibold">ס"ש: {formatPrice(property.price_weekend)}</span>
                </div>
              ) : (
                <>
                  <span className="text-sm sm:text-lg font-bold text-charcoal">
                    החל מ: {formatPrice(property.price_per_night)}
                  </span>
                  <span className="text-xs sm:text-sm text-taupe"> / לילה</span>
                </>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

export function PropertyCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="bg-sand-100" style={{ aspectRatio: '4/3' }} />
      <div className="p-3 sm:p-4 space-y-3">
        <div className="h-3 bg-sand-100 rounded w-1/3 mr-auto" />
        <div className="h-4 bg-sand-100 rounded w-3/4 mr-auto" />
        <div className="flex gap-2 justify-end">
          <div className="h-6 bg-sand-100 rounded-full w-16" />
          <div className="h-6 bg-sand-100 rounded-full w-12" />
        </div>
        <div className="flex justify-between pt-2 border-t border-sand-100">
          <div className="h-4 bg-sand-100 rounded w-16" />
          <div className="h-4 bg-sand-100 rounded w-20" />
        </div>
      </div>
    </div>
  )
}
