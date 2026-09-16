import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/layout/Navbar'
import { SearchBar } from '@/components/search/SearchBar'
import { REGIONS, CATEGORIES } from '@/lib/constants'
import { LatestProperties } from '@/components/property/LatestProperties'
import { NewProperties } from '@/components/property/NewProperties'
import { FeaturedAttractions } from '@/components/FeaturedAttractions'
import { FeaturedCaravans } from '@/components/FeaturedCaravans'
import { GlobalSearch } from '@/components/search/GlobalSearch'
import { IconHeart, IconUsers, IconBuilding, IconPawPrint, IconWaves, IconBath, IconShield, IconCalendar, IconSunset, IconSparkles, IconZap } from '@/components/icons'

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'zimmer.club',
  url: 'https://www.zimmer.club',
  logo: 'https://www.zimmer.club/logo.png',
  description: 'פלטפורמת הנופש הגדולה בישראל — צימרים, וילות, קרוואנים ואטרקציות',
  sameAs: ['https://www.facebook.com/zimmerclub', 'https://www.instagram.com/zimmerclub'],
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'zimmer.club',
  url: 'https://www.zimmer.club',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: 'https://www.zimmer.club/search?q={search_term_string}' },
    'query-input': 'required name=search_term_string',
  },
}

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />

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
                { href: '/search?available=today',    label: 'פנוי להיום',        Icon: IconZap },
                { href: '/search?available=weekend',  label: 'סוף"ש הקרוב',       Icon: IconSunset },
                { href: '/search?available=thursday', label: 'חמישי הקרוב',       Icon: IconCalendar },
                { href: '/search?available=friday',   label: 'שישי הקרוב',        Icon: IconSparkles },
              ].map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
                  style={{
                    background: 'rgba(255,255,255,0.92)',
                    boxShadow: '0 2px 10px rgba(61,47,32,0.12)',
                    border: '1px solid rgba(61,47,32,0.08)',
                    color: '#3D2F20',
                  }}
                >
                  <item.Icon size={13} />
                  {item.label}
                </a>
              ))}
            </div>

            {/* Show on map CTA */}
            <div className="mt-4">
              <Link
                href="/search?view=map"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #C8960C, #8B6914)',
                  boxShadow: '0 4px 16px rgba(139,105,20,0.35)',
                }}
              >
                <span>🗺️</span>
                הצג נכסים על המפה
              </Link>
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
        <NewProperties />
        <LatestProperties />

        <FeaturedAttractions />
        <FeaturedCaravans />

        {/* CATEGORIES */}
        <section className="py-14 overflow-hidden" style={{ background: 'linear-gradient(180deg, #fafaf8 0%, #f5f0e8 100%)' }}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="font-bold uppercase tracking-widest mb-1.5" style={{ color: '#B8964A', fontSize: '10px' }}>◈ קטגוריות פופולריות</p>
                <h2 className="section-title">חפשו לפי סגנון</h2>
              </div>
              <Link href="/search" className="text-sm font-semibold hover:underline hidden sm:block" style={{ color: '#8B6914' }}>כל הנכסים ←</Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4" style={{ gridAutoRows: '130px' }}>
              {[
                { key: 'couples',  href: '/search?amenity=couples',        label: 'רומנטי',              Icon: IconHeart,    desc: 'נכסים מושלמים לזוגות',       img: 'https://images.unsplash.com/photo-1657692310479-48b1dd077231?w=800&q=80' },
                { key: 'families', href: '/search?amenity=families',       label: 'מתאים למשפחות',       Icon: IconUsers,    desc: 'מרחב ונוחות לכל המשפחה',   img: 'https://images.unsplash.com/photo-1760531486152-90af0bc99c2f?w=800&q=80' },
                { key: 'villa',    href: '/search?category=villa',         label: 'וילות יוקרה',         Icon: IconBuilding, desc: 'חוויה יוקרתית ומפנקת',     img: 'https://images.unsplash.com/photo-1762811054947-605b20298615?w=800&q=80' },
                { key: 'pets',     href: '/search?amenity=pets',           label: 'ידידותי לבעלי חיים',  Icon: IconPawPrint, desc: 'גם הכלב מוזמן',            img: 'https://images.unsplash.com/photo-1785952473255-96900d71547c?w=800&q=80' },
                { key: 'pool',     href: '/search?amenity=pool',           label: 'עם בריכה',            Icon: IconWaves,    desc: 'קירור וכיף במים',           img: 'https://images.unsplash.com/photo-1713903315531-5fd73a271ecb?w=800&q=80' },
                { key: 'jacuzzi',  href: '/search?amenity=jacuzzi',        label: "עם ג'קוזי",           Icon: IconBath,     desc: 'רגיעה מוחלטת',             img: 'https://images.unsplash.com/photo-1772040942277-b194d9d0b648?w=800&q=80' },
                { key: 'shelter',  href: '/search?amenity=shelter_nearby', label: 'עם מרחב מוגן',        Icon: IconShield,   desc: 'בטחון ורוגע',              img: 'https://images.unsplash.com/photo-1770217614322-bcb9fa17f6ac?w=800&q=80' },
              ].map((cat) => (
                <Link
                  key={cat.key}
                  href={cat.href}
                  className="group relative rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl"
                  style={{ boxShadow: '0 4px 18px rgba(0,0,0,0.14)' }}
                >
                  <Image src={cat.img} alt={cat.label} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)' }} />
                  <div className="absolute bottom-0 right-0 left-0 p-3.5 text-white">
                    <p className="font-bold leading-tight" style={{ fontSize: '13px' }}>{cat.label}</p>
                    <p className="text-white/70 mt-0.5" style={{ fontSize: '10px' }}>{cat.desc}</p>
                  </div>
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}>
                    <cat.Icon size={14} color="#fff" />
                  </div>
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