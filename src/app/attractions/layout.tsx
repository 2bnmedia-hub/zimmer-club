import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'אטרקציות תיירותיות בישראל',
  description: 'אטרקציות, פעילויות ויעדי בילוי לכל המשפחה ברחבי ישראל — ספא, ג\'קוזי, טבע, הרפתקאות, סדנאות ועוד.',
  keywords: [
    'אטרקציות בישראל', 'פעילויות תיירות', 'בילויים בישראל', 'יעדי נופש ישראל',
    'אטרקציות למשפחות', 'פעילויות לילדים', 'טיולים בישראל', 'הרפתקאות בטבע',
    'ספא ישראל', 'גן שעשועים', 'קטיף פירות', 'רכיבה על סוסים', 'ג\'יפים בגולן',
    'אטרקציות בצפון', 'אטרקציות בגולן', 'אטרקציות בגליל', 'אטרקציות בדרום',
    'סדנת בישול', 'חדר בריחה ישראל', 'פעילות זוגית', 'פעילות קבוצתית',
    'israel attractions', 'things to do in israel',
  ],
  alternates: { canonical: 'https://www.zimmer.club/attractions' },
  openGraph: { title: 'אטרקציות תיירותיות בישראל | zimmer.club', description: 'פעילויות, אטרקציות ויעדי בילוי ברחבי ישראל — לזוגות, משפחות וחברים.', url: 'https://www.zimmer.club/attractions', locale: 'he_IL', type: 'website' },
}

export default function AttractionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
