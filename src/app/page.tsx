import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { SearchBar } from '@/components/search/SearchBar'
import { REGIONS, CATEGORIES } from '@/lib/constants'
import { LatestProperties } from '@/components/property/LatestProperties'
import { NewProperties } from '@/components/property/NewProperties'
import { FeaturedAttractions } from '@/components/FeaturedAttractions'
import { GlobalSearch } from '@/components/search/GlobalSearch'

export default function HomePage() {
  return (
    <>
      

      <main>
        {/* HERO */}
        <section className="relative min-h-[100svh] sm:min-h-[55vh] pt-20 sm:pt-16 flex flex-col items-center justify-center text-center px-4 py-8 overflow-hidden bg-transparent">
          
          {/* Background Image */}
<div
  className="absolute inset-0 z-0 overflow-hidden"
  style={{
    backgroundImage: "url('/hero-bg.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    animation: 'kenBurns 18s ease-in-out infinite',
    transformOrigin: 'center center',
  }}
/>
          {/* Overlay */}

          <div className="relative max-w-4xl mx-auto hero-text-animate" style={{zIndex:9999}}>
            
            {/* Title */}
            <h1 className="text-4xl sm:text-3xl lg:text-5xl font-bold leading-tight tracking-tight mb-4 sm:mb-6">
              <span style={{
                background: 'linear-gradient(120deg, #2c1810 0%, #8B4513 25%, #c9822a 50%, #8B4513 75%, #2c1810 100%)',
                backgroundSize: '300% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'warmGlow 4s ease-in-out infinite',
                textShadow: 'none',
                filter: 'drop-shadow(0 2px 8px rgba(139,69,19,0.3))',
                fontSize: '0.85em',
              }}>
                לא מחפשים חופשה
              </span>
              <br />
              <span style={{
                background: 'linear-gradient(120deg, #8B4513 0%, #d4a843 30%, #f5d078 55%, #d4a843 75%, #8B4513 100%)',
                backgroundSize: '300% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'warmGlow 4s ease-in-out infinite reverse',
                fontSize: '1.265em', marginTop: '0.3em',
                filter: 'drop-shadow(0 2px 12px rgba(212,168,67,0.4))',
              }}>
                מגלים אותה
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm lg:text-base text-taupe max-w-xl mx-auto mb-6 leading-relaxed">
              המקומות המיוחדים ביותר לחופשה בישראל.
              <br />
              צימרים, וילות, בתי אירוח ואטרקציות – במקום אחד.
            </p>

            {/* Global Search */}
            <GlobalSearch />

            {/* Search */}
            <SearchBar />

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6 sm:mt-8">
              {[
                { icon: '✦', text: 'ללא עמלת הזמנה' },
                { icon: '✦', text: 'קשר ישיר עם בעל הנכס' },
                { icon: '✦', text: 'מעל 1,000 נכסי תיירות' },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: '#C4A46B' }}
                >
                  <span style={{ color: '#8B6914', fontSize: '10px' }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </section>
        <LatestProperties />
        <NewProperties />

        <FeaturedAttractions />

        {/* CARAVANS GRID */}
        <section className="py-20 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#B8964A' }}>חוויה ייחודית</p>
                <h2 className="section-title shimmer-text" style={{ fontSize: '170%' }}>קרוואנים ומסעות</h2>
              </div>
              <Link href="/caravans" className="text-sm font-medium hover:underline" style={{ color: '#8B6914' }}>כל הקרוואנים ←</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:grid-cols-4">
              {[
                { name: 'קרוואן יוקרה גולן', location: 'רמת הגולן', price: 890, nights: 'ללילה', img: 'https://images.unsplash.com/photo-1561361058-c12e02b4c1a5?w=600&q=80', wide: true },
                { name: 'אוטו קרוואן צפון', location: 'גליל עליון', price: 650, nights: 'ללילה', img: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=600&q=80', wide: false },
                { name: 'קרוואן מוצב ים המלח', location: 'ים המלח', price: 750, nights: 'ללילה', img: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80', wide: false },
                { name: 'נגרר בסגנון וינטג׳', location: 'נגב', price: 580, nights: 'ללילה', img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&q=80', wide: false },
              ].map((item, i) => (
                <div key={i} className={`group relative rounded-3xl overflow-hidden cursor-pointer ${item.wide ? 'md:col-span-2 md:row-span-2' : ''}`}
                  style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)', minHeight: item.wide ? '380px' : '220px' }}>
                  <img src={item.img} alt={item.name}
                    className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />
                  <div className="absolute bottom-0 right-0 left-0 p-5 text-white">
                    <h3 className="font-bold text-lg mb-0.5">{item.name}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white/70">📍 {item.location}</p>
                      <p className="font-bold text-sm" style={{ color: '#F5C842' }}>₪{item.price} {item.nights}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="section-padding bg-white">
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

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.key}
                  href={cat.href}
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

    </>
  )
}