'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/', icon: '🏠', label: 'ホーム' },
  { href: '/calendar', icon: '📅', label: 'カレンダー' },
  { href: '/menu', icon: '🤖', label: 'メニュー' },
  { href: '/record', icon: '📊', label: '記録' },
  { href: '/history', icon: '📝', label: '履歴' },
]

function getActiveTab(pathname: string): string {
  if (pathname === '/') return '/'
  if (pathname.startsWith('/training')) return '/calendar'
  const segment = '/' + pathname.split('/')[1]
  return TABS.some((t) => t.href === segment) ? segment : '/'
}

export default function BottomNav() {
  const pathname = usePathname()
  const activeTab = getActiveTab(pathname)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex max-w-lg mx-auto">
        {TABS.map(({ href, icon, label }) => {
          const isActive = activeTab === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center pt-3 pb-2 gap-1 transition-colors select-none ${
                isActive
                  ? 'text-orange-500'
                  : 'text-zinc-600 hover:text-zinc-400 active:text-zinc-300'
              }`}
            >
              <span className="text-xl leading-none">{icon}</span>
              <span
                className={`text-[10px] font-semibold tracking-wide ${
                  isActive ? 'text-orange-500' : ''
                }`}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
