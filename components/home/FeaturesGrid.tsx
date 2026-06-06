'use client'

import { motion } from 'framer-motion'
import GlassCard from '@/components/shared/GlassCard'

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="8" height="12" rx="2" />
        <rect x="13" y="3" width="8" height="16" rx="2" />
        <path d="M6 9H8" />
        <path d="M16 8H18" />
        <path d="M16 12H19" />
      </svg>
    ),
    title: '双模式评审',
    description: '单张作品深度分析 + 完整作品集综合审阅，覆盖从课程作业到求职作品集的全场景',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3L20 8V16L12 21L4 16V8L12 3Z" />
        <path d="M12 7V12L16 15" />
        <path d="M12 12L8 15" />
        <path d="M12 12V17" />
      </svg>
    ),
    title: '7维度分析',
    description: '从创意概念到商业价值，科学覆盖设计评审的每个关键维度',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19H20" />
        <path d="M6 15H9" />
        <path d="M11 11H14" />
        <path d="M16 7H19" />
        <path d="M7.5 15V19" />
        <path d="M12.5 11V19" />
        <path d="M17.5 7V19" />
      </svg>
    ),
    title: 'S~E 评分体系',
    description: '七档评分结合红牌封顶与高分校准，解释每个等级的依据',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 4H15A3 3 0 0 1 18 7V13A3 3 0 0 1 15 16H10L6 20V16H5A3 3 0 0 1 2 13V7A3 3 0 0 1 5 4Z" />
        <path d="M8 8H13" />
        <path d="M8 12H11" />
        <path d="M19 8H20A2 2 0 0 1 22 10V15A2 2 0 0 1 20 17H19" />
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
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#F4EFE6] md:text-3xl">
          核心功能
        </h2>
        <p className="mt-3 text-[#F4EFE6]/46">从上传到获得专业评审，仅需几分钟</p>
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
            <GlassCard className="flex h-full flex-col gap-4" hover={false}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#F4EFE6]/10 bg-[#11100E]/64 text-[#D6A85A]">
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-[#F4EFE6]">{feature.title}</h3>
              <p className="text-sm text-[#F4EFE6]/48 leading-relaxed">{feature.description}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
