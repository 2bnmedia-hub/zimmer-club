import Link from 'next/link'

const footerLinks = {
  'אירוח': [
    { href: '/search', label: 'חיפוש נכסים' },
    { href: '/search?category=romantic', label: 'נכסים רומנטיים' },
    { href: '/search?category=luxury', label: 'וילות יוקרה' },
    { href: '/search?category=family', label: 'מתאים למשפחות' },
    { href: '/search?category=pet_friendly', label: 'ידידותי לבעלי חיים' },
  ],
  'בעלי נכסים': [
    { href: '/advertise', label: 'פרסמו את הנכס שלכם' },
    { href: '/advertise', label: 'איך זה עובד' },
    { href: '/dashboard/owner', label: 'לוח בקרה' },
    { href: '/about', label: 'תמחור ועמלות' },
  ],
  'zimmer.club': [
    { href: '/about', label: 'אודות' },
    { href: '/guide', label: 'מדריך נסיעות' },
    { href: '/advertise#form', label: 'צור קשר' },
    { href: '/accessibility', label: 'נגישות' },
  ],
}

const SOCIAL_LINKS = [
  { icon: '📘', label: 'פייסבוק', href: 'https://facebook.com/zimmerclub' },
  { icon: '📸', label: 'אינסטגרם', href: 'https://instagram.com/zimmerclub' },
  { icon: '🎵', label: 'טיקטוק', href: 'https://tiktok.com/@zimmerclub' },
]

export function Footer() {
  return (
    <footer className="text-cream-50/70" style={{background:"linear-gradient(135deg, #00854E 0%, #006039 45%, #004D2E 100%)"}}>
      <div className="page-container">
        {/* Main footer */}
        <div className="py-10 sm:py-14 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="text-2xl font-bold text-cream-50 mb-3">
              zimmer<span className="text-gold">.</span>club
            </div>
            <p className="text-sm leading-relaxed mb-4">
              חוויות אירוח בלתי נשכחות ברחבי ישראל — גלו את חופשת היוקרה המושלמת שלכם.
            </p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-sm"
                >
                  <span aria-hidden="true">{s.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-bold text-cream-50 mb-4 uppercase tracking-wider">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-cream-50 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-between text-xs text-cream-50/50">
          <p>© {new Date().getFullYear()} zimmer.club — כל הזכויות שמורות</p>
          <p className="text-xs text-cream-50/40">מבית <a href="https://2bnmedia.com" target="_blank" rel="noopener noreferrer" className="hover:text-cream-50 transition-colors">2bnmedia.com</a></p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-cream-50 transition-colors">פרטיות</Link>
            <Link href="/terms" className="hover:text-cream-50 transition-colors">תנאי שימוש</Link>
            <Link href="/accessibility" className="hover:text-cream-50 transition-colors">נגישות</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
