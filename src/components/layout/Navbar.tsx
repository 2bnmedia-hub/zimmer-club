'use client'
import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { IconMenu, IconX, IconSearch, IconUser, IconChevronDown, IconLogOut, IconSettings } from '@/components/icons'
import { cn } from '@/lib/utils'
import { ZIMMER_MENU, VILLAS_MENU, ATTRACTIONS_MENU, CARAVAN_MENU } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/contexts/ProfileContext'

const NAV_ITEMS = [
  { href: '/hotels', label: 'מלונות' },
  { href: '/camping', label: 'קמפינג' },
  { href: '/deals', label: 'מבצעים', badge: true },
  { href: '/advertise', label: 'פרסמו באתר' },
  { href: '/find', label: 'אתרו צימר' },
]

type MenuItem = { href: string; label: string }

function MegaMenu({ sections, onClose, isOpen }: {
  sections: { title: string; icon: string; items: MenuItem[] }[]
  onClose: () => void
  isOpen: boolean
}) {
  const [visible, setVisible] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    if (isOpen) {
      setMounted(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    } else {
      setVisible(false)
      const t = setTimeout(() => setMounted(false), 180)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  if (!mounted) return null

  return (
    <div
      className="hidden lg:block absolute top-full right-0 left-0 z-[9999]"
      style={{
        background: 'rgba(255,255,255,0.98)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(139,105,20,0.10)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.10), 0 4px 16px rgba(139,105,20,0.06)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scaleY(1)' : 'scaleY(0.7)',
        transformOrigin: 'top',
        transition: visible
          ? 'opacity 0.1s ease, transform 0.2s cubic-bezier(0.34,1.8,0.64,1)'
          : 'opacity 0.08s ease, transform 0.1s ease',
      }}
    >
      <style>{`
        @keyframes megaFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mega-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 12px;
          border-radius: 10px;
          font-size: 13.5px;
          color: #3D2B1A;
          transition: all 0.15s;
          text-decoration: none;
          position: relative;
        }
        .mega-link:hover {
          background: rgba(139,105,20,0.07);
          color: #8B6914;
          padding-right: 16px;
        }
        .mega-link::before {
          content: '';
          position: absolute;
          right: 6px;
          top: 50%;
          transform: translateY(-50%) scaleY(0);
          width: 2px;
          height: 12px;
          background: #C4956A;
          border-radius: 2px;
          transition: transform 0.15s;
        }
        .mega-link:hover::before { transform: translateY(-50%) scaleY(1); }
      `}</style>

      <div className="max-w-7xl mx-auto px-8 py-8" dir="rtl">
        <div className="grid grid-cols-3 gap-0 divide-x divide-x-reverse">
          {sections.map((section, i) => (
            <div key={section.title} className={cn('px-8', i === 0 && 'pr-0', i === sections.length - 1 && 'pl-0')}>
              <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid rgba(139,105,20,0.10)' }}>
                <span className="text-base">{section.icon}</span>
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#B8964A', letterSpacing: '0.14em' }}>
                  {section.title}
                </h3>
              </div>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} onClick={onClose} className="mega-link">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-5 flex items-center justify-between" style={{ borderTop: '1px solid rgba(139,105,20,0.08)' }}>
          <p className="text-xs" style={{ color: '#C4A882' }}>מעל 1,000 נכסי תיירות בכל רחבי הארץ</p>
          <Link
            href="/search"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all hover:scale-105"
            style={{ background: 'rgba(139,105,20,0.08)', color: '#8B6914', border: '1px solid rgba(139,105,20,0.18)' }}
          >
            לכל החיפוש המתקדם ←
          </Link>
        </div>
      </div>
    </div>
  )
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [user, setUser] = useState<{ name: string; role: string; avatar?: string | null } | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const supabase = createClient()
  const { avatarUrl, refreshKey } = useProfile()

  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role, avatar_url')
        .eq('id', authUser.id)
        .single()
      setUser({
        name: profile?.full_name || authUser.email || '',
        role: profile?.role || 'guest',
        avatar: avatarUrl || profile?.avatar_url || null,
      })
    }
    loadUser()
  }, [refreshKey])

  useEffect(() => {
    if (avatarUrl) setUser(prev => prev ? { ...prev, avatar: avatarUrl } : prev)
  }, [avatarUrl])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/'
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setActiveMenu(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const toggleMenu = (name: string) => setActiveMenu(prev => prev === name ? null : name)

  const zimmerSections = [
    { title: 'לפי אזור', icon: '📍', items: ZIMMER_MENU.byRegion },
    { title: 'לפי קהל יעד', icon: '👥', items: ZIMMER_MENU.byAudience },
    { title: 'לפי זמינות', icon: '📅', items: ZIMMER_MENU.byAvailability },
  ]
  const villasSections = [
    { title: 'לפי אזור', icon: '📍', items: VILLAS_MENU.byRegion },
    { title: 'לפי קהל יעד', icon: '👥', items: VILLAS_MENU.byAudience },
    { title: 'חיפושים פופולריים', icon: '🔥', items: VILLAS_MENU.byFeatures },
  ]
  const caravanSections = [
    { title: 'סוג קרוואן', icon: '🚐', items: CARAVAN_MENU.byType },
    { title: 'לפי אזור', icon: '📍', items: CARAVAN_MENU.byRegion },
    { title: 'חיפושים פופולריים', icon: '🔥', items: CARAVAN_MENU.byFeature },
  ]
  const attractionsSections = [
    { title: 'לפי אזור', icon: '📍', items: ATTRACTIONS_MENU.byRegion },
    { title: 'לפי קהל יעד', icon: '👥', items: ATTRACTIONS_MENU.byAudience },
    { title: 'אטרקציות פופולריות', icon: '⭐', items: ATTRACTIONS_MENU.popular as { href: string; label: string }[] },
  ]

  return (
    <header ref={navRef} className="sticky top-0 z-[99999] bg-white border-b border-gray-200 shadow-sm h-[64px] sm:h-[85px]" dir="rtl">
      <nav className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-[64px] sm:h-[85px]">

          <Link href="/" className="shrink-0" onClick={() => setActiveMenu(null)}>
            <img src="/logo.png" alt="Zimmer Club" className="h-10 sm:h-16 w-auto logo-shine" />
          </Link>

          <ul className="hidden lg:flex items-center list-none w-full justify-evenly">
            {[
              { name: 'zimmer', label: 'צימרים' },
              { name: 'villas', label: 'וילות ובקתות' },
              { name: 'attractions', label: 'אטרקציות' },
              { name: 'caravans', label: 'קרוואנים' },
            ].map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => toggleMenu(item.name)}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-all"
                  style={{
                    color: activeMenu === item.name ? '#8B6914' : '#374151',
                    background: activeMenu === item.name ? 'rgba(139,105,20,0.07)' : 'transparent',
                  }}
                >
                  {item.label}
                  <IconChevronDown className={cn('w-4 h-4 transition-transform duration-200', activeMenu === item.name && 'rotate-180')} />
                </button>
              </li>
            ))}
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setActiveMenu(null)}
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

          <div className="hidden lg:flex items-center gap-1 shrink-0 flex-nowrap">
            <button onClick={() => setActiveMenu(null)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <IconSearch className="w-5 h-5 text-gray-600" />
            </button>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => toggleMenu('user')}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors whitespace-nowrap"
                >
                  {user.avatar ? (
                    <Image src={user.avatar} alt="" width={28} height={28} className="w-7 h-7 rounded-full object-cover border border-[#C4956A]/30" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C4956A]/30 to-[#1B5E3B]/20 flex items-center justify-center">
                      <IconUser className="w-4 h-4 text-[#C4956A]" />
                    </div>
                  )}
                  <span>שלום, {user.name.split(' ')[0]}</span>
                  <IconChevronDown className={cn('w-3 h-3 transition-transform', activeMenu === 'user' && 'rotate-180')} />
                </button>
                {activeMenu === 'user' && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 min-w-52 py-2 overflow-hidden" dir="rtl">
                    <div className="px-4 py-3 border-b border-gray-100 mb-1">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {user.role === 'admin' ? 'מנהל מערכת' : user.role === 'owner' ? 'בעל נכס' : 'גולש'}
                      </p>
                    </div>
                    <Link href={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/owner'}
                      onClick={() => setActiveMenu(null)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                        <IconUser className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                      לוח בקרה
                    </Link>
                    <Link href="/dashboard/profile"
                      onClick={() => setActiveMenu(null)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-[#C4956A]/10 flex items-center justify-center">
                        <IconSettings className="w-3.5 h-3.5 text-[#C4956A]" />
                      </div>
                      עריכת פרופיל
                    </Link>
                    <Link href="/dashboard/properties/new"
                      onClick={() => setActiveMenu(null)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-500 text-sm font-bold">+</span>
                      </div>
                      הוספת צימר/וילה/בקתה
                    </Link>
                    <Link href="/dashboard/attractions/new"
                      onClick={() => setActiveMenu(null)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-500 text-sm font-bold">🎯</span>
                      </div>
                      הוספת אטרקציה
                    </Link>
                    <Link href="/dashboard/caravans/new"
                      onClick={() => setActiveMenu(null)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-500 text-sm font-bold">🚐</span>
                      </div>
                      הוספת קרוואן
                    </Link>
                    <hr className="my-2 border-gray-100" />
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                        <IconLogOut className="w-3.5 h-3.5 text-red-500" />
                      </div>
                      התנתק
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors whitespace-nowrap">
                  כניסה
                </Link>
                <Link href="/auth/register"
                  className="px-3 py-1.5 text-xs font-bold text-white rounded-full transition-colors whitespace-nowrap"
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
            {mobileOpen ? <IconX className="w-5 h-5" /> : <IconMenu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      <MegaMenu sections={zimmerSections} onClose={() => setActiveMenu(null)} isOpen={activeMenu === 'zimmer'} />
      <MegaMenu sections={villasSections} onClose={() => setActiveMenu(null)} isOpen={activeMenu === 'villas'} />
      <MegaMenu sections={attractionsSections} onClose={() => setActiveMenu(null)} isOpen={activeMenu === 'attractions'} />
      <MegaMenu sections={caravanSections} onClose={() => setActiveMenu(null)} isOpen={activeMenu === 'caravans'} />

      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200" dir="rtl">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {[
              { name: 'zimmer', label: 'צימרים', items: [...ZIMMER_MENU.byRegion, ...ZIMMER_MENU.byAudience, ...ZIMMER_MENU.byAvailability] },
              { name: 'villas', label: 'וילות ובקתות', items: [...VILLAS_MENU.byRegion, ...VILLAS_MENU.byAudience, ...VILLAS_MENU.byFeatures] },
              { name: 'attractions', label: 'אטרקציות', items: [...ATTRACTIONS_MENU.byRegion, ...ATTRACTIONS_MENU.byAudience, ...ATTRACTIONS_MENU.popular] },
              { name: 'caravans', label: 'קרוואנים', items: [...CARAVAN_MENU.byType, ...CARAVAN_MENU.byRegion, ...CARAVAN_MENU.byFeature] },
            ].map((menu) => (
              <div key={menu.name} style={{ borderBottom: '1px solid rgba(139,105,20,0.06)' }}>
                <button onClick={() => toggleMenu(menu.name)}
                  className="flex items-center justify-between w-full px-4 py-3.5 text-sm font-medium rounded-xl transition-all"
                  style={{
                    color: activeMenu === menu.name ? '#8B6914' : '#374151',
                    background: activeMenu === menu.name ? 'rgba(139,105,20,0.04)' : 'transparent',
                  }}>
                  {menu.label}
                  <IconChevronDown className={cn('w-4 h-4 transition-transform duration-200', activeMenu === menu.name && 'rotate-180')} />
                </button>
                {activeMenu === menu.name && (
                  <div className="pb-3 px-2 grid grid-cols-2 gap-1">
                    {menu.items.map((item) => (
                      <Link key={item.label} href={item.href}
                        onClick={() => { setMobileOpen(false); setActiveMenu(null) }}
                        className="block px-3 py-2 text-sm rounded-lg transition-all"
                        style={{ color: '#3D2B1A' }}
                        onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(139,105,20,0.06)'; (e.target as HTMLElement).style.color = '#8B6914' }}
                        onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; (e.target as HTMLElement).style.color = '#3D2B1A' }}>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href}
                onClick={() => { setActiveMenu(null); setMobileOpen(false) }}
                className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-200 space-y-1">
              {user ? (
                <>
                  <div className="px-4 py-2">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.role === 'admin' ? 'מנהל' : user.role === 'owner' ? 'בעל נכס' : 'גולש'}</p>
                  </div>
                  <Link href={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/owner'}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl">
                    לוח בקרה
                  </Link>
                  <Link href="/dashboard/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-[#C4956A] hover:bg-[#C4956A]/5 rounded-xl">
                    <IconSettings className="w-4 h-4" />
                    עריכת פרופיל
                  </Link>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl">
                    <IconLogOut className="w-4 h-4" />
                    התנתק
                  </button>
                </>
              ) : (
                <Link href="/auth/login" className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl">
                  כניסה / הרשמה
                </Link>
              )}
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
    <header className="sticky top-0 z-[99999] bg-white border-b border-gray-200 shadow-sm h-[64px] sm:h-[85px]" dir="rtl">
      <nav className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-[64px] sm:h-[85px]">
          <Link href="/" className="shrink-0">
            <img src="/logo.png" alt="Zimmer Club" className="h-10 sm:h-16 w-auto logo-shine" />
          </Link>
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
          <Link href={dashboardHref} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors whitespace-nowrap">
            <IconUser className="w-4 h-4" />
            <span>{userName}</span>
          </Link>
        </div>
      </nav>
    </header>
  )
}
