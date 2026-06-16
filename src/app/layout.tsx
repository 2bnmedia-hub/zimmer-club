import type { Metadata } from 'next'
import { Assistant } from 'next/font/google'
import '@/styles/globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ScrollToTop } from '@/components/ScrollToTop'
import { ProfileProvider } from '@/contexts/ProfileContext'
import Script from 'next/script'

const assistant = Assistant({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-assistant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'zimmer.club — צימרים ווילות יוקרה בישראל',
    template: '%s | zimmer.club',
  },
  description: 'מצאו צימרים רומנטיים, וילות יוקרה ובתי אירוח ייחודיים ברחבי ישראל. הזמנה מיידית, ביטול חינם.',
  keywords: ['צימרים', 'וילות', 'אירוח', 'ישראל', 'נופש', 'רומנטי', 'משפחות'],
  authors: [{ name: 'zimmer.club' }],
  creator: 'zimmer.club',
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    url: 'https://zimmer.club',
    siteName: 'zimmer.club',
    title: 'zimmer.club — צימרים ווילות יוקרה בישראל',
    description: 'מצאו צימרים רומנטיים, וילות יוקרה ובתי אירוח ייחודיים ברחבי ישראל.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'zimmer.club',
    description: 'צימרים ווילות יוקרה בישראל',
  },
  icons: { icon: '/favicon.ico' },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={assistant.variable}>
      <body className={`${assistant.className} antialiased`}>
          <ProfileProvider>
          <Navbar />
      <ScrollToTop />
          {children}
          <Footer />
        </ProfileProvider>
        <Script
          src="https://cdn.userway.org/widget.js"
          data-account="tsH0mnwtm1" data-position="left"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
