import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'חיפוש צימרים, וילות ובתי אירוח בישראל | zimmer.club',
  description: 'חפשו מתוך מאות צימרים, וילות, קרוואנים ובתי אירוח ברחבי ישראל. סננו לפי אזור, מחיר, תאריכים ושירותים. הזמנה מיידית.',
  alternates: { canonical: 'https://zimmer.club/search' },
  openGraph: {
    title: 'חיפוש צימרים בישראל | zimmer.club',
    description: 'מאות צימרים ווילות בכל רחבי הארץ — גליל, גולן, ים המלח, נגב ועוד.',
    url: 'https://zimmer.club/search',
    locale: 'he_IL',
    type: 'website',
  },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
