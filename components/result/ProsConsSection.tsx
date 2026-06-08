'use client'

import { motion } from 'framer-motion'

interface ProsConsSectionProps {
  pros: string[]
  cons: string[]
}

function ReviewList({
  title,
  tone,
  items,
}: {
  title: string
  tone: 'good' | 'risk'
  items: string[]
}) {
  const color = tone === 'good' ? '#7EB98E' : '#D6A85A'

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="border-t border-[#F4EFE6]/10 pt-5 first:border-t-0 first:pt-0 md:border-t-0 md:pt-0"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#F4EFE6]">{title}</h3>
        </div>
        <span className="text-xs text-[#F4EFE6]/32">{items.length} 项</span>
      </div>

      <ul className="space-y-0">
        {items.map((item, index) => (
          <li key={index} className="grid grid-cols-[28px_1fr] gap-3 border-t border-[#F4EFE6]/7 py-4 first:border-t-0 first:pt-0">
            <span
              className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
              style={{ backgroundColor: `${color}18`, color }}
            >
              {tone === 'good' ? '✓' : index + 1}
            </span>
            <p className="text-[15px] leading-7 text-[#F4EFE6]/68">{item}</p>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

export default function ProsConsSection({ pros, cons }: ProsConsSectionProps) {
  return (
    <div>
      <div className="mb-6">
        <p className="report-kicker">保留与修正</p>
        <h2 className="report-title mt-1 text-xl">先区分哪些不用动，哪些必须改</h2>
      </div>
      <div className="grid gap-8 md:grid-cols-2 md:gap-10">
        <ReviewList title="可以保留的部分" tone="good" items={pros} />
        <ReviewList title="需要优先处理的问题" tone="risk" items={cons} />
      </div>
    </div>
  )
}
