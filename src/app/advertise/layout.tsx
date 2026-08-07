import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'פרסמו את הנכס שלכם',
  description: 'הצטרפו לרשת הצימרים, הוילות והנכסים המובילה בישראל. פרסמו חינם, קבלו חשיפה לאלפי מטיילים בכל חודש, ושמרו 100% מהתשלום.',
  alternates: { canonical: 'https://www.zimmer.club/advertise' },
  openGraph: {
    title: 'פרסמו את הנכס ב-zimmer.club',
    description: 'הצטרפו לפלטפורמת האירוח המובילה בישראל. הרשמה חינמית.',
    url: 'https://www.zimmer.club/advertise',
    locale: 'he_IL',
    type: 'website',
  },
}

export default function AdvertiseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
