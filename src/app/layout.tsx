import type { Metadata } from 'next'
import { Assistant } from 'next/font/google'
import '@/styles/globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ScrollToTop } from '@/components/ScrollToTop'
import { ProfileProvider } from '@/contexts/ProfileContext'
import { WishlistProvider } from '@/hooks/useWishlist'
import Script from 'next/script'
import ZimiWidget from '@/components/ZimiWidget'
import { CookieConsent } from '@/components/CookieConsent'

const assistant = Assistant({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-assistant',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.zimmer.club'),
  title: {
    default: 'zimmer.club — צימרים ווילות יוקרה בישראל',
    template: '%s | zimmer.club',
  },
  description: 'מצאו צימרים רומנטיים, וילות יוקרה ובתי אירוח ייחודיים ברחבי ישראל. נופש בצפון, בגולן, בים המלח ועוד. הזמנה מיידית ללא עמלה.',
  keywords: [
    'צימרים', 'צימר', 'וילה', 'וילות', 'בית נופש', 'דירת נופש', 'השכרת נופש', 'אירוח ישראל',
    'נופש בישראל', 'חופשה בישראל', 'טיול בארץ', 'סוף שבוע רומנטי', 'הזמנת צימר', 'מחירי צימרים',
    'צימר רומנטי', 'וילה עם בריכה', 'צימר עם ג\'קוזי', 'צימר משפחתי', 'צימר יוקרה', 'וילות יוקרה', 'בית נופש פרטי',
    'נופש בצפון', 'נופש בגליל', 'נופש בגולן', 'נופש בכנרת', 'נופש בחרמון', 'נופש בים המלח', 'נופש בנגב', 'נופש באילת', 'נופש בירושלים',
    'לינה בטבע', 'גלמפינג', 'קרוואן להשכרה', 'אוהל יוקרה',
    'zimmer israel', 'villa israel', 'vacation rental israel', 'zimmer club',
  ],
  authors: [{ name: 'zimmer.club' }],
  creator: 'zimmer.club',
  alternates: { canonical: 'https://www.zimmer.club' },
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    url: 'https://www.zimmer.club',
    siteName: 'zimmer.club',
    title: 'zimmer.club — צימרים ווילות יוקרה בישראל',
    description: 'מצאו צימרים רומנטיים, וילות יוקרה ובתי אירוח ייחודיים ברחבי ישראל.',
    images: [
      {
        url: 'https://www.zimmer.club/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'zimmer.club — צימרים ווילות יוקרה בישראל',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'zimmer.club',
    description: 'צימרים ווילות יוקרה בישראל',
    images: ['https://www.zimmer.club/opengraph-image'],
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
          <WishlistProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-[999999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:text-gray-900 focus:font-bold focus:shadow-lg focus:border focus:border-gray-300"
            >
              דלג לתוכן הראשי
            </a>
            <Navbar />
            <ScrollToTop />
            <div id="main-content">{children}</div>
            <Footer />
            <ZimiWidget />
            <CookieConsent />
          </WishlistProvider>
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
