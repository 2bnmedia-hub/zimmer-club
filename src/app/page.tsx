import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { SearchBar } from '@/components/search/SearchBar'
import { REGIONS, CATEGORIES } from '@/lib/constants'
import { LatestProperties } from '@/components/property/LatestProperties'
import { NewProperties } from '@/components/property/NewProperties'
import { FeaturedAttractions } from '@/components/FeaturedAttractions'
import { FeaturedCaravans } from '@/components/FeaturedCaravans'
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

            {/* Quick Availability Filters */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              {[
                { href: '/search?available=today',    label: 'פנוי להיום',        icon: '📅' },
                { href: '/search?available=weekend',  label: 'סוף"ש הקרוב',       icon: '🌅' },
                { href: '/search?available=thursday', label: 'חמישי הקרוב',       icon: '🗓️' },
                { href: '/search?available=friday',   label: 'שישי הקרוב',        icon: '✨' },
              ].map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
                  style={{
                    background: 'rgba(255,255,255,0.18)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.35)',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </a>
              ))}
            </div>

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
        <FeaturedCaravans />

        {/* CATEGORIES */}
        <section className="py-20 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-12">
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

        {/* SEO Content Section */}
        <section className="py-16 bg-amber-50/40 border-t border-amber-100">
          <div className="max-w-5xl mx-auto px-4" dir="rtl">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
              צימרים ובתי הארחה ברחבי ישראל
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-gray-600 leading-relaxed">
              <div>
                <h3 className="font-bold text-gray-800 mb-2 text-base">צימרים בצפון</h3>
                <p>הגליל העליון, הגולן והכנרת מציעים מגוון עצום של צימרים רומנטיים עם נוף מרהיב. מושלם לזוגות ומשפחות המחפשים שקט ואוויר הרים נקי.</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2 text-base">צימרים בדרום</h3>
                <p>אילת, הנגב ומדבר יהודה מציעים חוויה שונה לגמרי — שמי לילה מלאי כוכבים, חופי ים אדום ותרבות בדואית אותנטית. הכניסו רומנטיקה למדבר.</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2 text-base">מה לקחת לצימר?</h3>
                <p>בגדים נוחים, נעלי בית, שמנים ארומטיים ומוזיקה אהובה — כי הצימר הוא הבית שלכם לסוף שבוע. רוב הצימרים כוללים מגבות, שמפו וסבון.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-10">
              {[
                { href: '/search?region=galil', label: 'צימרים בגליל' },
                { href: '/search?region=golan', label: 'צימרים בגולן' },
                { href: '/search?region=dead_sea', label: 'ים המלח' },
                { href: '/search?region=negev', label: 'צימרים בנגב' },
                { href: '/guide', label: '📋 מה לקחת לצימר?' },
              ].map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-center py-3 px-4 rounded-xl bg-white border border-amber-200 text-amber-800 text-sm font-medium hover:bg-amber-50 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

    </>
  )
}