'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import GlassCard from '@/components/shared/GlassCard'

const ENTRIES = [
  {
    key: 'single',
    title: '作品评审',
    description: '上传单张设计作品，获取 7 维度的专业评分与导师点评',
    tag: '支持 JPG / PNG',
    href: '/analyze',
    iconClassName: 'border-[#6B9CFF]/18 bg-[#6B9CFF]/8 text-[#8EB4FF] group-hover:text-[#F4EFE6]',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="11" height="14" rx="2" />
        <path d="M8 8H12" />
        <path d="M8 12H11" />
        <path d="M17 7L20 10L12 18H9V15L17 7Z" />
      </svg>
    ),
  },
  {
    key: 'portfolio',
    title: '作品集评审',
    description: '上传完整作品集 PDF，从项目质量、设计思维到岗位匹配度全面审阅',
    tag: '支持 PDF · 7维加权评分',
    href: '/portfolio',
    iconClassName: 'border-[#7EB98E]/18 bg-[#7EB98E]/8 text-[#7EE0A0] group-hover:text-[#F4EFE6]',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="3" width="13" height="18" rx="2" />
        <path d="M8 7H13" />
        <path d="M8 11H14" />
        <path d="M8 15H12" />
        <path d="M18 8H20V19A2 2 0 0 1 18 21H9" />
      </svg>
    ),
  },
]

export default function EntryCards() {
  return (
    <section className="space-y-4">
      <h2 className="text-center text-sm font-semibold text-[#F4EFE6]/42">
        选择评审模式
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {ENTRIES.map((entry, i) => (
          <motion.div
            key={entry.key}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
          >
            <Link href={entry.href}>
              <GlassCard className="group h-full cursor-pointer p-6 transition-all duration-300 hover:bg-[#1E1C19] hover:border-[#F4EFE6]/18">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors ${entry.iconClassName}`}>
                    {entry.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-[#F4EFE6] transition-colors">
                      {entry.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#F4EFE6]/48 leading-relaxed">
                      {entry.description}
                    </p>
                    <span className="inline-block mt-3 rounded-full border border-[#6B9CFF]/18 bg-[#6B9CFF]/8 px-2.5 py-1 text-[11px] font-medium text-[#8EB4FF]">
                      {entry.tag}
                    </span>
                  </div>
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
