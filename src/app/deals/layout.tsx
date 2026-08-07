import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'מבצעי הבזק — צימרים בהנחה להזמנה מיידית',
  description: 'מבצעים מיוחדים על צימרים, וילות ובתי אירוח בישראל. הזמנה מיידית, מחירים הכי טובים, לזמן מוגבל.',
  alternates: { canonical: 'https://www.zimmer.club/deals' },
  openGraph: {
    title: 'מבצעי הבזק | zimmer.club',
    description: 'צימרים בהנחה — הזמנה מיידית ומחירים מיוחדים לזמן מוגבל.',
    url: 'https://www.zimmer.club/deals',
    locale: 'he_IL',
    type: 'website',
  },
}

export default function DealsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
