'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Search, User } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/zimmerim', label: 'צימרים' },
  { href: '/villas', label: 'וילות ובקתות' },
  { href: '/hotels', label: 'מלונות' },
  { href: '/attractions', label: 'אטרקציות' },
  { href: '/camping', label: 'קמפינג' },
  { href: '/deals', label: 'מבצעים', badge: true },
  { href: '/advertise', label: 'פרסמו אצלנו' },
  { href: '/find', label: 'מצא לי זימר' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm" dir="rtl">
      <nav className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="shrink-0">
            <img src="/logo.png" alt="Zimmer Club" className="h-12 w-auto" />
          </Link>

          <ul className="hidden lg:flex items-center gap-1 list-none flex-1 justify-center">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={item.badge
                    ? 'px-4 py-2 text-sm font-medium text-white rounded-full transition-colors'
                    : 'px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors'
                  }
                  style={item.badge ? { backgroundColor: '#8B6914' } : {}}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden lg:flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <Link href="/auth/login" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
              <User className="w-4 h-4" />
              <span>שלום אורח, התחבר</span>
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="תפריט"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200" dir="rtl">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-200">
              <Link href="/auth/login" className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl">
                כניסה / הרשמה
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export function NavbarAuth({ userName, role }: { userName: string; role: 'guest' | 'owner' | 'admin' }) {
  const dashboardHref = role === 'admin' ? '/dashboard/admin' : '/dashboard/owner'
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm" dir="rtl">
      <nav className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="shrink-0">
            <img src="/logo.png" alt="Zimmer Club" className="h-12 w-auto" />
          </Link>
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
          <Link href={dashboardHref} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <User className="w-4 h-4" />
            <span>{userName}</span>
          </Link>
        </div>
      </nav>
    </header>
  )
}