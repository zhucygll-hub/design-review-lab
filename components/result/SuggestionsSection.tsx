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
  low: 'text-[#F4EFE6]/48 bg-[#F4EFE6]/6',
  medium: 'text-[#8EB4FF] bg-[#6B9CFF]/10',
  high: 'text-[#D6A85A] bg-[#D6A85A]/10',
}

export default function SuggestionsSection({ suggestions }: SuggestionsSectionProps) {
  const priorities = suggestions.filter((suggestion) => suggestion.type === 'priority')
  const quickFixes = suggestions.filter((suggestion) => suggestion.type === 'quick_fix')
  const routeItems = [...priorities, ...quickFixes]

  return (
    <div className="report-panel overflow-hidden">
      <div className="border-b border-[#F4EFE6]/10 p-6">
        <p className="report-kicker">下一版修改路线</p>
        <h2 className="report-title mt-2 text-xl">按这个顺序改，不要同时乱改</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#F4EFE6]/48">
          优先项解决会影响总评的结构性问题，快速项用于在不大改方案的情况下提升完成度。
        </p>
      </div>

      <div className="divide-y divide-[#F4EFE6]/8">
        {routeItems.map((suggestion, index) => {
          const isPriority = suggestion.type === 'priority'
          return (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              className="grid gap-4 p-5 md:grid-cols-[88px_1fr_170px] md:items-start"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                    isPriority ? 'bg-[#D6A85A]/12 text-[#D6A85A]' : 'bg-[#6B9CFF]/12 text-[#8EB4FF]'
                  }`}
                >
                  {index + 1}
                </span>
                <span className="text-xs text-[#F4EFE6]/38">
                  {isPriority ? '优先项' : '快速项'}
                </span>
              </div>

              <p className="text-sm leading-6 text-[#F4EFE6]/68">{suggestion.content}</p>

              <div className="flex flex-wrap gap-2 md:justify-end">
                <span className={`rounded-full px-2.5 py-1 text-xs ${effortColors[suggestion.effort]}`}>
                  {effortLabels[suggestion.effort]}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs ${impactColors[suggestion.impact]}`}>
                  {impactLabels[suggestion.impact]}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
