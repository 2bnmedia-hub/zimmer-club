import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'

export const metadata = { title: 'הצהרת נגישות | Zimmer Club Israel' }

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]" dir="rtl">
      <main className="max-w-3xl mx-auto px-4 py-12">

        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">← חזרה לדף הבית</Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">הצהרת נגישות</h1>
          <p className="text-sm text-gray-400">עודכן לאחרונה: ינואר 2026</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8 text-gray-700 leading-relaxed">

          <p className="text-base">
            אתר <strong>Zimmer Club Israel</strong> רואה חשיבות רבה בהנגשת שירותיו הדיגיטליים לכלל הציבור ופועל באופן מתמשך לשיפור חוויית השימוש עבור אנשים עם מוגבלויות. אנו מחויבים לקידום עקרונות השוויון, הכבוד, העצמאות והנגישות.
          </p>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">מחויבות לנגישות</h2>
            <p>מטרתנו היא לאפשר לכל אדם, לרבות אנשים עם מוגבלויות, להשתמש באתר ולקבל את השירותים והמידע המוצגים בו באופן שוויוני, מכובד ועצמאי ככל הניתן.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">התאמות הנגישות באתר</h2>
            <p className="mb-3">האתר הונגש בהתאם להוראות תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג–2013, ובהתאם לדרישות התקן הישראלי ת"י 5568, המבוסס על הנחיות W3C ברמת AA.</p>
            <p className="mb-2">האתר נבדק ומותאם לדפדפנים:</p>
            <ul className="list-disc list-inside space-y-1 text-sm pr-2">
              <li>Google Chrome</li>
              <li>Mozilla Firefox</li>
              <li>Safari</li>
              <li>Microsoft Edge</li>
              <li>Opera</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">כלי הנגישות באתר</h2>
            <ul className="list-disc list-inside space-y-1.5 text-sm pr-2">
              <li>התאמת ניגודיות צבעים (כהה ובהירה)</li>
              <li>התאמות לצורכי משתמשים עם לקויות בראיית צבעים</li>
              <li>הדגשת כותרות וקישורים</li>
              <li>הצגת חלופות טקסטואליות לתמונות (ALT)</li>
              <li>אפשרויות נוספות לשיפור חוויית הקריאה</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">פניות בנושא נגישות</h2>
            <p className="mb-3">אם נתקלתם בקושי הקשור לנגישות, נשמח לקבל פנייה עם:</p>
            <ul className="list-disc list-inside space-y-1.5 text-sm pr-2">
              <li>תיאור הבעיה</li>
              <li>כתובת הדף שבו התרחשה הבעיה</li>
              <li>סוג הדפדפן וגרסתו</li>
              <li>מערכת ההפעלה</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">פרטי קשר</h2>
            <a href="mailto:zimmer.club.israel@gmail.com" className="text-[#8B6914] font-medium hover:underline">
              zimmer.club.israel@gmail.com
            </a>
          </section>

          <p className="text-xs text-gray-400 border-t border-gray-100 pt-4">הצהרת נגישות זו עודכנה לאחרונה בחודש ינואר 2026.</p>
        </div>
      </main>

    </div>
  )
}
