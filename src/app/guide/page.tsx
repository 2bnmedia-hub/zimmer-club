import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'מה לקחת לצימר? המדריך המלא | Zimmer Club',
  description: 'רשימת הציוד הכי מומלצת לחופשה מושלמת בצימר — בגדים, טואלטיקה, בילויים וטיפים שימושיים מניסיון.',
}

const sections = [
  {
    title: 'ביגוד ולינה',
    icon: '👕',
    items: [
      'בגדים נוחים — לפי מספר הלילות',
      'בגד ים (אם יש בריכה / ג\'קוזי)',
      'נעלי בית',
      'גלימת אמבטיה (ברוב הצימרים יש, אבל כדאי לבדוק)',
      'פיג\'מה / בגדי שינה',
      'ז\'קט קל ללילה — גם בקיץ ההרים מתקררים',
    ],
  },
  {
    title: 'טואלטיקה',
    icon: '🧴',
    items: [
      'מברשת שיניים ומשחה',
      'שמפו ומרכך (ברוב הצימרים יש, אבל לא תמיד)',
      'סבון / ג\'ל מקלחת',
      'קרם לחות',
      'תרופות אישיות וסם כאב',
      'קרם הגנה (חשוב תמיד)',
      'תרסיס נגד יתושים — בייחוד בצפון',
    ],
  },
  {
    title: 'בידור ורומנטיקה',
    icon: '🕯️',
    items: [
      'נרות ריחניים',
      'מוזיקה אהובה (רמקול Bluetooth)',
      'משחקי קלפים / קופסא',
      'ספר טוב לשלווה',
      'כלי כתיבה ומשחקי צוות — לקבוצות',
      'יין / שתייה חינמית מהסופר',
    ],
  },
  {
    title: 'אוכל וצניינות',
    icon: '🥗',
    items: [
      'ארוחת בוקר — קפה, ביצים, לחם',
      'חטיפים ופירות',
      'כלי בישול בסיסיים — אם אין מטבח מאובזר',
      'בקבוק מים לכל יוצאי הדרך',
      'אמצעי ברביקיו / סחורה לצלייה',
      'מסנן קפה / קפסולות — בדקו מראש מה יש',
    ],
  },
  {
    title: 'ציוד שכח לא לשכוח',
    icon: '🔌',
    items: [
      'מטען לטלפון',
      'מצלמה',
      'ספריית סרטים אופליין (למקרה אין סיגנל)',
      'כניסה / קוד מצורף מהמארח',
      'מפה — לא בכל מקום יש GPS',
      'כסף מזומן — חנויות קטנות בכפרים',
    ],
  },
]

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-amber-50/30" dir="rtl">
      {/* Hero */}
      <div className="py-16 px-4 text-center" style={{ background: 'linear-gradient(135deg, #C8960C 0%, #8B6914 100%)' }}>
        <p className="text-white/70 text-sm mb-2 font-medium uppercase tracking-widest">המדריך</p>
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">מה לקחת לצימר?</h1>
        <p className="text-white/80 text-lg max-w-lg mx-auto">
          הכנו עבורכם רשימה מסודרת כדי שלא תשכחו כלום — ותצאו עם חיוך
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Quick Tips */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100 mb-10">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">💡 טיפים לפני היציאה</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2"><span className="text-amber-600 font-bold mt-0.5">•</span>בדקו מראש עם המארח מה כלול — מגבות, שמפו, קפה, כלי מיטה.</li>
            <li className="flex items-start gap-2"><span className="text-amber-600 font-bold mt-0.5">•</span>שאלו על חיות מחמד אם מתכננים להגיע עם כלב.</li>
            <li className="flex items-start gap-2"><span className="text-amber-600 font-bold mt-0.5">•</span>הורידו מפות אופליין לאזור — בצפון ובנגב לא תמיד יש קליטה.</li>
            <li className="flex items-start gap-2"><span className="text-amber-600 font-bold mt-0.5">•</span>הגיעו עם מעט מזומן לאטרקציות וחנויות מקומיות.</li>
          </ul>
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {sections.map((section) => (
            <div key={section.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">{section.icon}</span>
                {section.title}
              </h2>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-amber-500 mt-1 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-500 mb-4">מוכנים לצאת לדרך? מצאו את הצימר שלכם</p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #C8960C, #8B6914)' }}
          >
            חפשו צימר
          </Link>
        </div>
      </div>
    </div>
  )
}
