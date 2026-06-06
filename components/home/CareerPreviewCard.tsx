'use client'

import { motion } from 'framer-motion'

export default function CareerPreviewCard() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className="report-panel flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8"
    >
      <div className="flex items-start gap-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#D6A85A]/20 bg-[#D6A85A]/10 text-[#D6A85A]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-[#F4EFE6]">求职分析</h3>
            <span className="rounded-full bg-[#D6A85A]/12 px-2.5 py-1 text-xs font-medium text-[#D6A85A]">
              即将上线
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#F4EFE6]/52">
            匹配目标岗位与公司，获得针对性的差距分析、面试准备建议和作品集项目排序。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs text-[#F4EFE6]/44 md:min-w-[300px]">
        {['岗位匹配', '项目取舍', '面试提问'].map((item) => (
          <span key={item} className="rounded-full border border-[#F4EFE6]/10 px-3 py-2">
            {item}
          </span>
        ))}
      </div>
    </motion.section>
  )
}
