'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { IconSearch, IconMapPin, IconCalendar, IconUsers, IconHome, IconChevronDown, IconChevronUp, IconChevronLeft, IconChevronRight, IconStar, IconHeart, IconUser, IconPhone, IconGlobe, IconNavigation, IconArrowRight, IconZap, IconEye, IconEyeOff, IconUpload, IconTrash, IconEdit, IconPlus, IconCheck, IconMail, IconSend, IconRefresh, IconSparkles, IconBed, IconBath, IconTrendingUp, IconLoader, IconCamera, IconSave, IconAlertCircle, IconCheckCircle, IconClock, IconSliders, IconPencil, IconQr, IconShare, IconDownload, IconZoomIn, IconZoomOut, IconLogOut, IconSettings, IconMenu, IconX } from '@/components/icons'
import { cn, formatPrice, truncate } from '@/lib/utils'
import type { Property } from '@/types'
import { REGIONS, CATEGORIES } from '@/lib/constants'

interface PropertyCardProps {
  property: Property
  className?: string
}

export function PropertyCard({ property, className }: PropertyCardProps) {
  const [isFaved, setIsFaved] = useState(false)

  const primaryImage = property.images?.find((img) => img.is_primary) || property.images?.[0]
  const region = REGIONS[property.region]

  return (
    <Link href={`/property/${property.id}`}>
      <article
        className={cn(
          'card group cursor-pointer overflow-hidden transition-all duration-300',
          'hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(61,47,32,0.10)]',
          className
        )}
      >
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-sand-100">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || property.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-sand-100 to-sand-200 flex items-center justify-center text-5xl opacity-40">
              🏠
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
            {property.instant_book && (
              <span className="badge badge-gold flex items-center gap-1">
                <IconZap className="w-3 h-3" />
                הזמנה מיידית
              </span>
            )}
            {property.category?.includes('luxury') && (
              <span className="badge bg-espresso/90 text-cream-50 text-xs px-2.5 py-0.5">
                יוקרה
              </span>
            )}
          </div>

          {/* Favorite */}
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsFaved(!isFaved)
            }}
            className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-transform hover:scale-110"
            aria-label={isFaved ? 'הסר ממועדפים' : 'הוסף למועדפים'}
          >
            <Heart
              className={cn('w-4 h-4 transition-colors', isFaved ? 'fill-red-500 text-red-500' : 'text-taupe')}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Location */}
          <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-taupe mb-1.5">
            <IconMapPin className="w-3 h-3" />
            {region?.label} • {property.city}
          </div>

          {/* Name */}
          <h3 className="font-bold text-base text-charcoal leading-snug mb-2">
            {truncate(property.name, 50)}
          </h3>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3 justify-end">
            {property.amenities?.slice(0, 3).map((amenity) => (
              <span key={amenity.key} className="text-xs font-medium text-taupe bg-cream-100 border border-sand-100 px-2 py-0.5 rounded-full">
                {amenity.label_he}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-sand-100">
            {/* Rating */}
            <div className="flex items-center gap-1">
              <IconStar className="w-3.5 h-3.5 fill-gold text-gold" />
              <span className="text-sm font-bold text-charcoal">{property.avg_rating?.toFixed(1)}</span>
              <span className="text-xs text-taupe">({property.total_reviews})</span>
            </div>

            {/* Price */}
            <div className="text-left ltr">
              <span className="text-base font-bold text-charcoal">
                החל מ: {formatPrice(property.price_per_night)}
              </span>
              <span className="text-xs text-taupe"> / לילה</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

// Skeleton loader
export function PropertyCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-52 bg-sand-100" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-sand-100 rounded w-1/3" />
        <div className="h-4 bg-sand-100 rounded w-3/4" />
        <div className="flex gap-2">
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
