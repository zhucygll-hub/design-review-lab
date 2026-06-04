'use client'

import { motion } from 'framer-motion'
import GlassCard from '@/components/shared/GlassCard'

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4F8CFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6V12L16 14" />
      </svg>
    ),
    title: '双模式评审',
    description: '单张作品深度分析 + 完整作品集综合审阅，覆盖从课程作业到求职作品集的全场景',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    title: '7维度分析',
    description: '从创意概念到商业价值，科学覆盖设计评审的每个关键维度',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: 'S~D 评分体系',
    description: '直观的五档评分与雷达图可视化，快速定位优势与不足',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21V19A4 4 0 0 0 13 15H5A4 4 0 0 0 1 19V21" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21V19A4 4 0 0 0 19 15H16" />
        <path d="M16 3.13A4 4 0 0 1 16 10.87" />
      </svg>
    ),
    title: '导师视角点评',
    description: '毕业导师、设计总监、面试官、用户研究员四角色给你针对性建议',
  },
]

export default function FeaturesGrid() {
  return (
    <section className="py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <h2 className="text-2xl font-bold md:text-3xl">核心功能</h2>
        <p className="mt-3 text-white/40">从上传到获得专业评审，仅需几分钟</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <GlassCard className="flex flex-col gap-4 h-full" hover={false}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold">{feature.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
