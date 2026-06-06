'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  {
    href: '/',
    label: '首页',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9L12 2L21 9V20A2 2 0 0 1 19 22H5A2 2 0 0 1 3 20Z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/analyze',
    label: '作品评审',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="11" height="14" rx="2" />
        <path d="M8 8H12" />
        <path d="M8 12H11" />
        <path d="M17 7L20 10L12 18H9V15L17 7Z" />
      </svg>
    ),
  },
  {
    href: '/portfolio',
    label: '作品集',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="3" width="13" height="18" rx="2" />
        <path d="M8 7H13" />
        <path d="M8 11H14" />
        <path d="M8 15H12" />
        <path d="M18 8H20V19A2 2 0 0 1 18 21H9" />
      </svg>
    ),
  },
  {
    href: '/history',
    label: '历史',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="border-t border-[#F4EFE6]/10 bg-[#181715]/96 px-2 py-2">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 transition-colors duration-200 ${
                  active ? 'text-[#D6A85A]' : 'text-[#F4EFE6]/42'
                }`}
              >
                {item.icon}
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
