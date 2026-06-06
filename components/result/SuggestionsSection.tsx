'use client'

import { motion } from 'framer-motion'
import { Suggestion } from '@/types'

interface SuggestionsSectionProps {
  suggestions: Suggestion[]
}

const effortLabels: Record<string, string> = {
  low: '低成本',
  medium: '中成本',
  high: '高成本',
}

const impactLabels: Record<string, string> = {
  low: '低影响',
  medium: '中影响',
  high: '高影响',
}

const effortColors: Record<string, string> = {
  low: 'text-[#7EB98E] bg-[#7EB98E]/10',
  medium: 'text-[#D6A85A] bg-[#D6A85A]/10',
  high: 'text-[#D6A85A] bg-[#D6A85A]/10',
}

const impactColors: Record<string, string> = {
  low: 'text-[#F4EFE6]/42 bg-[#F4EFE6]/5',
  medium: 'text-[#8EB4FF] bg-[#6B9CFF]/10',
  high: 'text-[#D6A85A] bg-[#D6A85A]/10',
}

export default function SuggestionsSection({ suggestions }: SuggestionsSectionProps) {
  const priorities = suggestions.filter((s) => s.type === 'priority')
  const quickFixes = suggestions.filter((s) => s.type === 'quick_fix')

  return (
    <div className="space-y-6">
      {/* Priority items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-sm font-semibold text-[#D6A85A] mb-3 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          优先修改项
        </h3>
        <div className="space-y-3">
          {priorities.map((s, i) => (
            <div key={s.id} className="report-panel-soft p-4 flex items-start gap-4">
              <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#D6A85A]/10 text-[#D6A85A] text-sm font-bold">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-6 text-[#F4EFE6]/68">{s.content}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${effortColors[s.effort]}`}>
                    {effortLabels[s.effort]}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${impactColors[s.impact]}`}>
                    {impactLabels[s.impact]}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick fixes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-sm font-semibold text-[#8EB4FF] mb-3 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          快速提升方案
        </h3>
        <div className="space-y-3">
          {quickFixes.map((s) => (
            <div key={s.id} className="report-panel-soft p-4 flex items-start gap-4">
              <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#6B9CFF]/10 text-[#8EB4FF]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-6 text-[#F4EFE6]/68">{s.content}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${effortColors[s.effort]}`}>
                    {effortLabels[s.effort]}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${impactColors[s.impact]}`}>
                    {impactLabels[s.impact]}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
