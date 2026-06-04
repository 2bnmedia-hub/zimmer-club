import type { Metadata } from 'next'
import { Assistant } from 'next/font/google'
import '@/styles/globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { IdleLogoutProvider } from '@/components/layout/IdleLogoutProvider'
import { WishlistProvider } from '@/hooks/useWishlist'
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
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl" className={assistant.variable}>
      <body className={`${assistant.className} antialiased`}>
        <WishlistProvider>
          <IdleLogoutProvider>
            <Navbar />
            {children}
          </IdleLogoutProvider>
        </WishlistProvider>
        <Script
          src="https://cdn.userway.org/widget.js"
          data-account="tsH0mnwtm1" data-position="left"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}