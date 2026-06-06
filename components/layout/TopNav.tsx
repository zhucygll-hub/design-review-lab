'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function TopNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 hidden md:block">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#F4EFE6] flex items-center justify-center text-[#11100E] font-bold text-sm">
            DR
          </div>
          <div>
            <span className="block text-lg font-semibold tracking-[-0.02em] text-[#F4EFE6]">
              设计评审实验室
            </span>
            <span className="block text-[11px] text-[#F4EFE6]/36">
              Design Review Lab
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1 rounded-full border border-[#F4EFE6]/10 bg-[#181715]/90 p-1">
          <Link
            href="/"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              isActive('/') && pathname === '/'
                ? 'bg-[#F4EFE6] text-[#11100E]'
                : 'text-[#F4EFE6]/52 hover:text-[#F4EFE6]'
            }`}
          >
            首页
          </Link>
          <Link
            href="/analyze"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              isActive('/analyze')
                ? 'bg-[#F4EFE6] text-[#11100E]'
                : 'text-[#F4EFE6]/52 hover:text-[#F4EFE6]'
            }`}
          >
            作品评审
          </Link>
          <Link
            href="/portfolio"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              isActive('/portfolio')
                ? 'bg-[#F4EFE6] text-[#11100E]'
                : 'text-[#F4EFE6]/52 hover:text-[#F4EFE6]'
            }`}
          >
            作品集评审
          </Link>
          <Link
            href="/history"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              isActive('/history')
                ? 'bg-[#F4EFE6] text-[#11100E]'
                : 'text-[#F4EFE6]/52 hover:text-[#F4EFE6]'
            }`}
          >
            历史记录
          </Link>
        </div>

        <div className="w-[80px]" />
      </div>
    </nav>
  )
}
