'use client'

import { motion } from 'framer-motion'
import GlassCard from '@/components/shared/GlassCard'
import Badge from '@/components/shared/Badge'
import { homePageCases } from '@/lib/mock-data'

export default function CaseShowcase() {
  return (
    <section className="py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <h2 className="text-2xl font-bold md:text-3xl">案例展示</h2>
        <p className="mt-3 text-white/40">看看其他人如何使用 AI 评审提升作品质量</p>
      </motion.div>

      <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-none">
        {homePageCases.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="snap-start shrink-0 w-[300px] md:w-[350px]"
          >
            <GlassCard className="flex flex-col gap-4 h-full">
              <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 animate-shimmer" />
                <div className="text-white/20 text-sm font-medium">{item.title}</div>
              </div>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-white/40 mt-1">{item.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge score="A" />
                <span className="text-xs text-white/40">{item.highlight}</span>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
