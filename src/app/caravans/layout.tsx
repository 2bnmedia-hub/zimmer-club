import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'קרוואנים וגלמפינג בישראל | zimmer.club',
  description: 'קרוואנים מאובזרים, גלמפינג וחוויות לינה ייחודיות בטבע. הגליל, הנגב, הגולן ועוד. הזמינו עכשיו.',
  alternates: { canonical: 'https://zimmer.club/caravans' },
  openGraph: { title: 'קרוואנים וגלמפינג בישראל | zimmer.club', url: 'https://zimmer.club/caravans', locale: 'he_IL', type: 'website' },
}

export default function CaravansLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
