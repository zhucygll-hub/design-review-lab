'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import GradientText from '@/components/shared/GradientText'

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
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#4F8CFF] to-[#7C3AED] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#4F8CFF]/20">
            DR
          </div>
          <GradientText className="text-lg font-bold">设计评审实验室</GradientText>
        </Link>

        <div className="flex items-center gap-1 rounded-full glass p-1">
          <Link
            href="/"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              isActive('/') && pathname === '/'
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white'
            }`}
          >
            首页
          </Link>
          <Link
            href="/analyze"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              isActive('/analyze')
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white'
            }`}
          >
            作品评审
          </Link>
          <Link
            href="/portfolio"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              isActive('/portfolio')
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white'
            }`}
          >
            作品集评审
          </Link>
          <Link
            href="/history"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              isActive('/history')
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white'
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
