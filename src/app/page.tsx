import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SearchBar } from '@/components/search/SearchBar'
import { REGIONS, CATEGORIES } from '@/lib/constants'
import { LatestProperties } from '@/components/property/LatestProperties'

export default function HomePage() {
  return (
    <>
      

      <main>
        {/* HERO */}
        <section className="relative min-h-[55vh] pt-36 flex flex-col items-center justify-center text-center px-4 py-8 overflow-hidden bg-transparent">
          
          {/* Background Image */}
<div
  className="absolute inset-0 z-0"
  style={{
    backgroundImage: "url('/hero-bg.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }}
/>
          {/* Overlay */}

          <div className="relative z-10 max-w-4xl mx-auto">
            
            {/* Title */}
            <h1 className="text-3xl lg:text-5xl font-bold leading-tight tracking-tight mb-6">
              <span style={{
                background: 'linear-gradient(135deg, #3d2f20 0%, #8B6914 50%, #3d2f20 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 3s linear infinite',
              }}>
                חוויית אירוח
              </span>
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #8B6914 0%, #c9a84c 40%, #8B6914 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 3s linear infinite reverse',
                fontSize: '1.15em',
              }}>
                שלא תשכחו
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm lg:text-base text-taupe max-w-xl mx-auto mb-6 leading-relaxed">
              צימרים רומנטיים - וילות יוקרה ובתי אירוח קסומים.
              <br />
              מחפשים את הבריחה המושלמת? מצאו אותה כאן
            </p>

            {/* Badge */}
            <div className="badge badge-gold text-sm mx-auto mb-10">
              ✦ מעל 1000 נכסי תיירות הפרוסים בכל הארץ
            </div>

            {/* Search */}
            <SearchBar />

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
              {[
                'ביטול חינם עד 48 שעות',
                'אישור מיידי',
                'תשלום מאובטח',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-sm text-taupe font-medium"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
        <LatestProperties />
        {/* CATEGORIES */}
        <section className="section-padding bg-cream-50">
          <div className="page-container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-taupe mb-2">
                  קטגוריות פופולריות
                </p>

                <h2 className="section-title">
                  חפשו לפי סגנון
                </h2>
              </div>

              <Link
                href="/search"
                className="text-sm font-semibold text-gold-deep hover:underline hidden sm:block"
              >
                כל הנכסים ←
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <Link
                  key={key}
                  href={`/search?category=${key}`}
                  className="card p-5 hover:border-gold transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="w-11 h-11 rounded-xl bg-cream-100 flex items-center justify-center text-2xl mb-4">
                    {cat.emoji}
                  </div>

                  <p className="font-bold text-charcoal text-base mb-1">
                    {cat.label}
                  </p>

                  <p className="text-xs text-taupe">
                    {cat.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}