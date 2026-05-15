'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Bell, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_LINKS, ZIMMER_MENU } from '@/lib/constants'

interface NavbarProps {
  transparent?: boolean
}

export function Navbar({ transparent = false }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [zimmerOpen, setZimmerOpen] = useState(false)
  const zimmerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (zimmerRef.current && !zimmerRef.current.contains(e.target as Node)) {
        setZimmerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        transparent ? 'bg-transparent' : 'bg-cream-50/95 backdrop-blur-md border-b border-sand-100'
      )}
    >
      <nav className="page-container">
        <div className="flex items-center justify-between h-16 lg:h-18">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 shrink-0">
            <img src="/logo.png" alt="Zimmer Club" className="h-14 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center gap-8 list-none">
            {/* צימרים dropdown */}
            <li>
              <div ref={zimmerRef} className="relative">
                <button
                  onClick={() => setZimmerOpen(!zimmerOpen)}
                  className="flex items-center gap-1 text-sm font-medium text-taupe hover:text-charcoal transition-colors duration-200"
                >
                  צימרים
                  <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', zimmerOpen && 'rotate-180')} />
                </button>
              </div>
            </li>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm font-medium text-taupe hover:text-charcoal transition-colors duration-200">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-taupe hover:text-charcoal transition-colors px-4 py-2">
              כניסה
            </Link>
            <Link href="/auth/register" className="btn-primary text-sm py-2 px-5">
              הרשמה חינם
            </Link>
          </div>

          {/* Mobile button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-sand-100 transition-colors"
            aria-label="תפריט"
          >
            {mobileOpen ? <X className="w-5 h-5 text-charcoal" /> : <Menu className="w-5 h-5 text-charcoal" />}
          </button>
        </div>
      </nav>

      {/* Mega Menu — מחוץ ל-nav, רוחב מלא */}
      {zimmerOpen && (
        <div className="hidden lg:block absolute top-full right-0 left-0 bg-white border-t border-sand-100 shadow-2xl z-50">
          <div className="page-container py-8" dir="rtl">
            <div className="grid grid-cols-3 gap-12">
              <div>
                <h3 className="text-xs font-bold text-taupe uppercase tracking-widest mb-4 border-b border-sand-100 pb-2">
                  צימרים לפי איזור
                </h3>
                <ul className="space-y-2">
                  {ZIMMER_MENU.byRegion.map((item) => (
                    <li key={item.label}>
                      <Link href={item.href} onClick={() => setZimmerOpen(false)}
                        className="text-sm text-charcoal hover:text-gold transition-colors block py-1">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-bold text-taupe uppercase tracking-widest mb-4 border-b border-sand-100 pb-2">
                  צימרים לפי קהל יעד
                </h3>
                <ul className="space-y-2">
                  {ZIMMER_MENU.byAudience.map((item) => (
                    <li key={item.label}>
                      <Link href={item.href} onClick={() => setZimmerOpen(false)}
                        className="text-sm text-charcoal hover:text-gold transition-colors block py-1">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-bold text-taupe uppercase tracking-widest mb-4 border-b border-sand-100 pb-2">
                  צימרים לפי זמינות
                </h3>
                <ul className="space-y-2">
                  {ZIMMER_MENU.byAvailability.map((item) => (
                    <li key={item.label}>
                      <Link href={item.href} onClick={() => setZimmerOpen(false)}
                        className="text-sm text-charcoal hover:text-gold transition-colors block py-1">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-cream-50 border-t border-sand-100" dir="rtl">
          <div className="page-container py-4 space-y-1">
            <div>
              <button
                onClick={() => setZimmerOpen(!zimmerOpen)}
                className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-taupe hover:text-charcoal hover:bg-sand-100 rounded-xl"
              >
                צימרים
                <ChevronDown className={cn('w-4 h-4 transition-transform', zimmerOpen && 'rotate-180')} />
              </button>
              {zimmerOpen && (
                <div className="px-4 pb-2 space-y-1">
                  {[...ZIMMER_MENU.byRegion, ...ZIMMER_MENU.byAudience, ...ZIMMER_MENU.byAvailability].map((item) => (
                    <Link key={item.label} href={item.href}
                      onClick={() => { setMobileOpen(false); setZimmerOpen(false) }}
                      className="block px-4 py-2 text-sm text-taupe hover:text-charcoal hover:bg-sand-100 rounded-lg">
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-taupe hover:text-charcoal hover:bg-sand-100 rounded-xl transition-colors">
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-sand-100 flex gap-2">
              <Link href="/auth/login" className="flex-1 btn-outline text-center text-sm py-2">כניסה</Link>
              <Link href="/auth/register" className="flex-1 btn-primary text-center text-sm py-2">הרשמה</Link>
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
    <header className="sticky top-0 z-50 bg-cream-50/95 backdrop-blur-md border-b border-sand-100">
      <nav className="page-container">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-charcoal">
            zimmer<span className="text-gold">.</span>club
          </Link>
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-taupe hover:text-charcoal">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl hover:bg-sand-100 transition-colors">
              <Bell className="w-5 h-5 text-taupe" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full" />
            </button>
            <Link href={dashboardHref}
              className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-sand-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gold-light flex items-center justify-center text-xs font-bold text-gold-deep">
                {userName.slice(0, 2)}
              </div>
              <span className="text-sm font-medium text-charcoal hidden sm:block">{userName}</span>
              <ChevronDown className="w-4 h-4 text-taupe" />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
