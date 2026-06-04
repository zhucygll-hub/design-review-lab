'use client'

import { motion } from 'framer-motion'
import GlassCard from '@/components/shared/GlassCard'

export default function CareerPreviewCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <GlassCard className="p-6 flex items-center gap-5 border-white/5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F59E0B]/15 to-[#EF4444]/10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white/70">求职分析</h3>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B]">
              即将上线
            </span>
          </div>
          <p className="mt-1 text-sm text-white/35">
            匹配目标岗位与公司，获得针对性的差距分析与面试准备建议
          </p>
        </div>
      </GlassCard>
    </motion.div>
  )
}
