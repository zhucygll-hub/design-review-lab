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
      className="report-panel p-6"
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="h-7 w-1.5 rounded-full" style={{ backgroundColor: color }} />
        <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#F4EFE6]">{title}</h3>
      </div>

      <ul className="space-y-4">
        {items.map((item, index) => (
          <li key={index} className="grid grid-cols-[28px_1fr] gap-3">
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
    <div className="grid gap-5 md:grid-cols-2">
      <ReviewList title="可以保留的部分" tone="good" items={pros} />
      <ReviewList title="需要优先处理的问题" tone="risk" items={cons} />
    </div>
  )
}
