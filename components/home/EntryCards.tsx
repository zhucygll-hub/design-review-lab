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
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    key: 'portfolio',
    title: '作品集评审',
    description: '上传完整作品集 PDF，从项目质量、设计思维到岗位匹配度的全面审阅',
    tag: '支持 PDF · 7维加权评分',
    href: '/portfolio',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
]

export default function EntryCards() {
  return (
    <section className="space-y-4">
      <h2 className="text-center text-sm font-semibold text-white/40 uppercase tracking-widest">
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
              <GlassCard className="group p-6 h-full transition-all duration-300 hover:scale-[1.02] hover:bg-white/[0.05] hover:border-white/15 cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#4F8CFF]/20 to-[#7C3AED]/20 text-[#4F8CFF] group-hover:text-[#7C3AED] transition-colors">
                    {entry.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-white/90 group-hover:text-white transition-colors">
                      {entry.title}
                    </h3>
                    <p className="mt-1 text-sm text-white/40 leading-relaxed">
                      {entry.description}
                    </p>
                    <span className="inline-block mt-3 text-[11px] font-medium text-[#4F8CFF]/70 bg-[#4F8CFF]/5 px-2.5 py-1 rounded-full">
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
