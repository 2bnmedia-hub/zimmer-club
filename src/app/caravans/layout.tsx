import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'קרוואנים וגלמפינג בישראל',
  description: 'קרוואנים מאובזרים, גלמפינג ולינה בטבע ברחבי ישראל. חוויה ייחודית בגליל, בנגב, בגולן ועוד. הזמינו עכשיו.',
  keywords: [
    'קרוואן להשכרה', 'קרוואנים בישראל', 'גלמפינג ישראל', 'לינה בטבע', 'אוהל יוקרה',
    'קרוואן נופש', 'קמפינג יוקרה', 'לינה ייחודית', 'קרוואן עם ג\'קוזי',
    'גלמפינג בגולן', 'גלמפינג בגליל', 'גלמפינג בנגב', 'גלמפינג בכנרת',
    'קרוואן מאובזר', 'נסיעה בקרוואן', 'טיול בקרוואן ישראל', 'glamping israel',
  ],
  alternates: { canonical: 'https://www.zimmer.club/caravans' },
  openGraph: { title: 'קרוואנים וגלמפינג בישראל | zimmer.club', description: 'קרוואנים מאובזרים וגלמפינג — לינה ייחודית בטבע ברחבי ישראל.', url: 'https://www.zimmer.club/caravans', locale: 'he_IL', type: 'website' },
}

export default function CaravansLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
