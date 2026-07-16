import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'אטרקציות תיירותיות בישראל | zimmer.club',
  description: 'אטרקציות, פעילויות ויעדי בילוי ברחבי ישראל — ספא, ג\'קוזי, טבע, הרפתקאות ועוד. הזמינו עכשיו.',
  alternates: { canonical: 'https://zimmer.club/attractions' },
  openGraph: { title: 'אטרקציות תיירותיות בישראל | zimmer.club', url: 'https://zimmer.club/attractions', locale: 'he_IL', type: 'website' },
}

export default function AttractionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
