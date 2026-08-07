import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'חיפוש צימרים, וילות ובתי אירוח בישראל',
  description: 'חפשו מתוך מאות צימרים, וילות, קרוואנים ובתי אירוח ברחבי ישראל. סננו לפי אזור, מחיר, תאריכים ושירותים. הזמנה מיידית ללא עמלה.',
  keywords: [
    'חיפוש צימרים', 'חיפוש וילות', 'מציאת נופש', 'השוואת מחירי צימרים',
    'צימרים זמינים', 'צימרים לסוף שבוע', 'נופש קרוב', 'בתי אירוח בישראל',
    'צימרים עם בריכה', 'צימרים עם ג\'קוזי', 'וילות להשכרה', 'צימרים זולים',
    'צימרים בגולן', 'צימרים בגליל', 'צימרים בכנרת', 'צימרים בים המלח',
    'צימרים בנגב', 'צימרים באילת', 'צימרים בירושלים', 'צימרים במרכז',
    'צימרים לזוגות', 'צימרים למשפחות', 'נופש רומנטי', 'נופש סוף שבוע',
  ],
  alternates: { canonical: 'https://www.zimmer.club/search' },
  openGraph: {
    title: 'חיפוש צימרים בישראל | zimmer.club',
    description: 'מאות צימרים ווילות בכל רחבי הארץ — גליל, גולן, ים המלח, נגב ועוד.',
    url: 'https://www.zimmer.club/search',
    locale: 'he_IL',
    type: 'website',
  },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
