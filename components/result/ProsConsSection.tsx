'use client'

import { motion } from 'framer-motion'

interface ProsConsSectionProps {
  pros: string[]
  cons: string[]
}

export default function ProsConsSection({ pros, cons }: ProsConsSectionProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Pros */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[#22C55E] mb-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          优点分析
        </h3>
        <ul className="space-y-3">
          {pros.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-white/60">
              <span className="mt-0.5 shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#22C55E]/10">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Cons */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[#F59E0B] mb-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          改进空间
        </h3>
        <ul className="space-y-3">
          {cons.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-white/60">
              <span className="mt-0.5 shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#F59E0B]/10">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  )
}
