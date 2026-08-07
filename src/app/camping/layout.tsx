import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'קמפינג ואוהלים בישראל',
  description: 'אתרי קמפינג, גלמפינג ואוהלים מאובזרים בטבע הישראלי. גליל, גולן, נגב ועוד. הזמינו עכשיו.',
  alternates: { canonical: 'https://www.zimmer.club/camping' },
  openGraph: { title: 'קמפינג בישראל | zimmer.club', url: 'https://www.zimmer.club/camping', locale: 'he_IL', type: 'website' },
}

export default function CampingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
