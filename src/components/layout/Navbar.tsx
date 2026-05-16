'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Search, User, ChevronDown, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ZIMMER_MENU, VILLAS_MENU, ATTRACTIONS_MENU } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/hotels', label: 'מלונות' },
  { href: '/camping', label: 'קמפינג' },
  { href: '/deals', label: 'מבצעים', badge: true },
  { href: '/advertise', label: 'פרסמו באתר' },
  { href: '/find', label: 'אתרו לי צימר' },
]

type MenuItem = { href: string; label: string }

function MegaMenu({ sections, onClose }: {
  sections: { title: string; items: MenuItem[] }[]
  onClose: () => void
}) {
  return (
    <div className="hidden lg:block absolute top-full right-0 left-0 bg-white border-t border-gray-200 shadow-2xl z-50">
      <div className="max-w-7xl mx-auto px-4 py-[4.1rem]" dir="rtl">
        <div className="grid grid-cols-3 gap-12">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} onClick={onClose}
                      className="text-sm text-gray-700 hover:text-yellow-700 transition-colors block py-0.5">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', authUser.id)
        .single()

      setUser({
        name: profile?.full_name || authUser.email || '',
        role: profile?.role || 'guest',
      })
    }
    loadUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/'
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const toggleMenu = (name: string) => {
    setActiveMenu(activeMenu === name ? null : name)
  }

  const zimmerSections = [
    { title: 'צימרים לפי איזור', items: ZIMMER_MENU.byRegion },
    { title: 'צימרים לפי קהל יעד', items: ZIMMER_MENU.byAudience },
    { title: 'צימרים לפי זמינות', items: ZIMMER_MENU.byAvailability },
  ]

  const villasSections = [
    { title: 'וילות לפי איזור', items: VILLAS_MENU.byRegion },
    { title: 'וילות לפי קהל יעד', items: VILLAS_MENU.byAudience },
    { title: 'חיפושים פופולריים', items: VILLAS_MENU.byFeatures },
  ]

  const attractionsSections = [
    { title: 'אטרקציות לפי איזור', items: ATTRACTIONS_MENU.byRegion },
    { title: 'אטרקציות לפי קהל יעד', items: ATTRACTIONS_MENU.byAudience },
    { title: 'אטרקציות פופולריות', items: ATTRACTIONS_MENU.popular as { href: string; label: string }[] },
  ]

  return (
    <header ref={navRef} className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm" dir="rtl">
      <nav className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="shrink-0">
            <img src="/logo.png" alt="Zimmer Club" className="h-16 w-auto" />
          </Link>

          <ul className="hidden lg:flex items-center gap-6 list-none flex-1 justify-center">
            {[
              { name: 'zimmer', label: 'צימרים' },
              { name: 'villas', label: 'וילות ובקתות' },
              { name: 'attractions', label: 'אטרקציות' },
            ].map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => toggleMenu(item.name)}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {item.label}
                  <ChevronDown className={cn('w-4 h-4 transition-transform', activeMenu === item.name && 'rotate-180')} />
                </button>
              </li>
            ))}
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href} onClick={() => setActiveMenu(null)}
                  className={item.badge
  ? 'relative px-4 py-2 text-sm font-bold text-white rounded-full transition-all hover:scale-105 hover:shadow-lg overflow-hidden'
  : 'px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors'
}
style={item.badge ? {
  background: 'linear-gradient(135deg, #C8960C 0%, #8B6914 50%, #C8960C 100%)',
  backgroundSize: '200% auto',
  animation: 'shimmer 2s linear infinite',
  boxShadow: '0 0 12px rgba(200,150,12,0.5)',
} : {}}
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
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>שלום, {user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {userMenuOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-48 py-1" dir="rtl">
                    <Link href={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/owner'}
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      לוח בקרה
                    </Link>
                    <Link href="/dashboard/properties/new"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      הוסף נכס
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="w-4 h-4" />
                      התנתק
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                  כניסה
                </Link>
                <Link href="/auth/register"
                  className="px-4 py-2 text-sm font-bold text-white rounded-full transition-colors"
                  style={{ backgroundColor: '#8B6914' }}>
                  הרשמה חינם
                </Link>
              </div>
            )}
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

      {activeMenu === 'zimmer' && (
        <MegaMenu sections={zimmerSections} onClose={() => setActiveMenu(null)} />
      )}
      {activeMenu === 'villas' && (
        <MegaMenu sections={villasSections} onClose={() => setActiveMenu(null)} />
      )}
      {activeMenu === 'attractions' && (
        <MegaMenu sections={attractionsSections} onClose={() => setActiveMenu(null)} />
      )}

      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200" dir="rtl">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {[
              { name: 'zimmer', label: 'צימרים', items: [...ZIMMER_MENU.byRegion, ...ZIMMER_MENU.byAudience, ...ZIMMER_MENU.byAvailability] },
              { name: 'villas', label: 'וילות ובקתות', items: [...VILLAS_MENU.byRegion, ...VILLAS_MENU.byAudience, ...VILLAS_MENU.byFeatures] },
              { name: 'attractions', label: 'אטרקציות', items: [...ATTRACTIONS_MENU.byRegion, ...ATTRACTIONS_MENU.byAudience, ...ATTRACTIONS_MENU.popular] },
            ].map((menu) => (
              <div key={menu.name}>
                <button
                  onClick={() => toggleMenu(menu.name)}
                  className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl"
                >
                  {menu.label}
                  <ChevronDown className={cn('w-4 h-4 transition-transform', activeMenu === menu.name && 'rotate-180')} />
                </button>
                {activeMenu === menu.name && (
                  <div className="px-4 space-y-1">
                    {menu.items.map((item) => (
                      <Link key={item.label} href={item.href}
                        onClick={() => { setMobileOpen(false); setActiveMenu(null) }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setActiveMenu(null)}
                onClick={() => { setActiveMenu(null); setMobileOpen(false) }}
                className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
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
            <img src="/logo.png" alt="Zimmer Club" className="h-16 w-auto" />
          </Link>
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setActiveMenu(null)}
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