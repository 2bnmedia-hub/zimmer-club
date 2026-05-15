import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SearchBar } from '@/components/search/SearchBar'
import { REGIONS, CATEGORIES } from '@/lib/constants'

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        {/* ===== HERO ===== */}
        <section className="relative min-h-[88vh] flex flex-col items-center justify-center text-center px-4 py-20 overflow-hidden">
          {/* Background */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background: `
                radial-gradient(ellipse 80% 60% at 30% 20%, rgba(201,169,110,0.12) 0%, transparent 70%),
                radial-gradient(ellipse 60% 50% at 80% 80%, rgba(122,140,114,0.08) 0%, transparent 60%),
                #FAF8F4
              `,
            }}
          />

          <div className="relative z-10 max-w-4xl mx-auto">
            {/* Badge */}
            <div className="badge badge-gold mb-7 text-sm">
              ✦ יותר מ-1,200 נכסים ייחודיים ברחבי הארץ
            </div>

            {/* Title */}
            <h1 className="text-5xl lg:text-7xl font-bold text-charcoal leading-tight tracking-tight mb-6">
              חוויית אירוח
              <br />
              <span className="text-gold-deep">שלא תשכחו</span>
            </h1>

            <p className="text-lg lg:text-xl text-taupe max-w-xl mx-auto mb-10 leading-relaxed">
              צימרים רומנטיים, וילות יוקרה ובתי אירוח קסומים.
              <br />
              מחפשים את הבריחה המושלמת? מצאו אותה כאן.
            </p>

            {/* Search */}
            <SearchBar />

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
              {[
                'ביטול חינם עד 48 שעות',
                'אישור מיידי',
                'תשלום מאובטח',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-taupe font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CATEGORIES ===== */}
        <section className="section-padding bg-cream-50">
          <div className="page-container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-taupe mb-2">
                  קטגוריות פופולריות
                </p>
                <h2 className="section-title">חפשו לפי סגנון</h2>
              </div>
              <Link href="/search" className="text-sm font-semibold text-gold-deep hover:underline hidden sm:block">
                כל הנכסים ←
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 stagger-children">
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <Link
                  key={key}
                  href={`/search?category=${key}`}
                  className="card p-5 hover:border-gold transition-all duration-200 hover:-translate-y-1 hover:shadow-md group"
                >
                  <div className="w-11 h-11 rounded-xl bg-cream-100 flex items-center justify-center text-2xl mb-4">
                    {cat.emoji}
                  </div>
                  <p className="font-bold text-charcoal text-base mb-1">{cat.label}</p>
                  <p className="text-xs text-taupe">{cat.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ===== REGIONS ===== */}
        <section className="section-padding bg-warm-white border-y border-sand-100">
          <div className="page-container">
            <div className="mb-10">
              <p className="text-xs font-bold uppercase tracking-widest text-taupe mb-2">
                חיפוש לפי אזור
              </p>
              <h2 className="section-title">גלו את ישראל</h2>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 stagger-children">
              {Object.entries(REGIONS).map(([key, region]) => (
                <Link
                  key={key}
                  href={`/search?region=${key}`}
                  className="card p-4 text-center hover:border-gold hover:bg-gold-light/30 transition-all duration-200 group"
                >
                  <span className="text-3xl mb-2 block">{region.emoji}</span>
                  <p className="text-xs font-bold text-charcoal leading-snug">{region.label}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA — OWNERS ===== */}
        <section className="py-20 px-4 bg-espresso text-center">
          <div className="max-w-2xl mx-auto">
            <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-4">
              לבעלי נכסים
            </p>
            <h2 className="text-4xl font-bold text-cream-50 mb-4 leading-tight">
              יש לכם צימר מדהים?
            </h2>
            <p className="text-cream-50/60 text-lg mb-8 leading-relaxed">
              הצטרפו לאלפי בעלי נכסים שמרוויחים דרך zimmer.club.
              <br />
              הרשמה פשוטה, ניהול קל, תשלומים מיידיים.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/owners" className="btn-gold">
                פרסמו את הנכס שלכם
              </Link>
              <Link href="/owners/how-it-works" className="btn-outline border-white/20 text-cream-50 hover:border-white/40">
                למדו עוד
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
