import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'שובר מילואים — נופש לחיילי מילואים | zimmer.club',
  description: 'צימרים ווילות המקבלים שובר מילואים. הזמינו נופש עם שובר מילואים ברחבי ישראל — צפון, גולן, ים המלח ועוד.',
  openGraph: {
    title: 'שובר מילואים | zimmer.club',
    description: 'נכסי נופש המקבלים שובר מילואים — הזמנה ישירה ללא עמלה.',
    locale: 'he_IL',
    type: 'website',
  },
}

const REGION_LABELS: Record<string, string> = {
  north: 'צפון', galil_west: 'גליל המערבי', galil_upper: 'גליל העליון',
  galil_lower: 'גליל התחתון', kinneret: 'כנרת', hermon: 'חרמון',
  center: 'מרכז', jerusalem: 'ירושלים', dead_sea: 'ים המלח',
  negev: 'דרום', eilat: 'אילת', golan: 'רמת הגולן',
}

export default async function MiluimPage() {
  const supabase = await createClient()

  const { data: properties } = await supabase
    .from('properties')
    .select('id, slug, name, city, region, price_per_night, avg_rating, total_reviews, property_images(url)')
    .eq('accepts_miluim', true)
    .eq('status', 'active')
    .order('avg_rating', { ascending: false })
    .limit(12)

  return (
    <main className="min-h-screen bg-white" dir="rtl">

      {/* Hero */}
      <section
        className="relative py-20 px-4 text-center text-white overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a3d1f 0%, #006039 50%, #0a5c30 100%)' }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(255,255,255,0.2) 0%, transparent 60%)' }} />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            🎖️ zimmer.club לחיילי המילואים
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            נופש מגיע לכם —<br />
            <span className="text-green-300">עם שובר מילואים</span>
          </h1>
          <p className="text-lg md:text-xl text-white/85 mb-8 leading-relaxed">
            כל הנכסים כאן מקבלים שובר מילואים רשמי.<br />
            הזמינו ישירות מהמארח ללא עמלה.
          </p>
          <Link
            href="/search?accepts_miluim=true"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-lg transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #C8960C 0%, #8B6914 100%)', boxShadow: '0 8px 24px rgba(200,150,12,0.4)' }}
          >
            🔍 חפש נכסים עם שובר מילואים
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-black text-gray-900 text-center mb-10">איך זה עובד?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '1', icon: '🔍', title: 'בחרו נכס', text: 'סננו לפי "מקבל שובר מילואים" ובחרו מבין הנכסים המאושרים.' },
            { step: '2', icon: '📱', title: 'צרו קשר', text: 'פנו ישירות למארח דרך ווטסאפ עם פרטי השובר שלכם.' },
            { step: '3', icon: '🏡', title: 'תהנו מהנופש', text: 'המארח מאשר את השובר ואתם מגיעים לנופש מגיע לכם.' },
          ].map(({ step, icon, title, text }) => (
            <div key={step} className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg, #C8960C, #8B6914)' }}>
                <span>{icon}</span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Properties */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-gray-900">
            נכסים המקבלים שובר מילואים
            {properties && properties.length > 0 && (
              <span className="mr-2 text-lg font-normal text-gray-400">({properties.length})</span>
            )}
          </h2>
          <Link href="/search?accepts_miluim=true"
            className="text-sm font-bold text-amber-700 hover:underline">
            הצג הכל ←
          </Link>
        </div>

        {!properties || properties.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg mb-4">אין עדיין נכסים עם שובר מילואים</p>
            <p className="text-sm">אם אתם בעלי נכס ומקבלים שוברי מילואים, <Link href="/advertise" className="text-amber-700 underline">פרסמו אצלנו</Link></p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p: any) => {
              const img = p.property_images?.[0]?.url
              const href = p.slug ? `/properties/${p.slug}` : `/property/${p.id}`
              return (
                <Link key={p.id} href={href} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5">
                  <div className="relative h-48 bg-gray-100">
                    {img ? (
                      <Image src={img} alt={p.name} fill sizes="(max-width:640px) 100vw,33vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🏡</div>
                    )}
                    <span className="absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full text-white"
                      style={{ background: '#006039' }}>
                      ✓ שובר מילואים
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 truncate">{p.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      📍 {p.city}{p.region ? ` · ${REGION_LABELS[p.region] || p.region}` : ''}
                    </p>
                    <div className="flex items-center justify-between">
                      {p.price_per_night > 0 ? (
                        <p className="font-black text-gray-900">
                          ₪{p.price_per_night.toLocaleString()}
                          <span className="text-xs font-normal text-gray-400 mr-1">/ לילה</span>
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400">מחיר בתיאום</p>
                      )}
                      {p.avg_rating > 0 && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          ⭐ {p.avg_rating}
                          <span className="text-gray-300">({p.total_reviews})</span>
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* CTA for owners */}
      <section className="bg-gray-50 py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-3">בעלי נכסים — מקבלים שוברי מילואים?</h2>
          <p className="text-gray-500 mb-6 leading-relaxed">
            הציגו זאת בנכס שלכם ב-zimmer.club ותגיעו ללקוחות מגזר המילואים שמחפשים מקום לנוח.
          </p>
          <Link href="/advertise"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #C8960C 0%, #8B6914 100%)' }}>
            פרסמו את הנכס שלכם
          </Link>
        </div>
      </section>
    </main>
  )
}
