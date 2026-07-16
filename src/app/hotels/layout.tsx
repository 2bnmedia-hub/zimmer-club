import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'מלונות בוטיק בישראל — חדרים ולינה | zimmer.club',
  description: 'מלונות בוטיק ובתי מלון קטנים ברחבי ישראל. גליל, ירושלים, ים המלח, אילת ועוד. הזמנה מיידית.',
  alternates: { canonical: 'https://zimmer.club/hotels' },
  openGraph: { title: 'מלונות בוטיק בישראל | zimmer.club', url: 'https://zimmer.club/hotels', locale: 'he_IL', type: 'website' },
}

export default function HotelsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
