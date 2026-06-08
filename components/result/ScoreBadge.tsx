'use client'

import { ReactNode, useState } from 'react'
import { motion } from 'framer-motion'
import { getScoreColor } from '@/lib/utils'

interface ScoreBadgeProps {
  score: string
  scoreLabel: string
  scoreNumeric: number
  evidence?: ReactNode
  compact?: boolean
}

export default function ScoreBadge({ score, scoreLabel, scoreNumeric, evidence, compact = false }: ScoreBadgeProps) {
  const color = getScoreColor(score)
  const [showEvidence, setShowEvidence] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="border-y border-[#F4EFE6]/10 py-5"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="report-kicker">综合评分</p>
          <div className="mt-3 flex flex-wrap items-end gap-4">
            <span className={`${compact ? 'text-6xl' : 'text-7xl'} leading-none font-semibold tracking-[-0.04em]`} style={{ color }}>
              {score}
            </span>
            <div className="pb-1">
              <p className={`${compact ? 'text-xl' : 'text-2xl'} font-semibold text-[#F4EFE6]`}>{scoreNumeric}/100</p>
              <p className="mt-1 text-sm text-[#F4EFE6]/48">{scoreLabel}</p>
            </div>
          </div>
          <p className="mt-4 max-w-[34rem] text-sm leading-6 text-[#F4EFE6]/52">
            分数只是入口。真正决定下一版怎么改的是右侧的关键问题和下方评分依据。
          </p>
        </div>

        {evidence && (
          <button
            type="button"
            onClick={() => setShowEvidence((value) => !value)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#F4EFE6]/12 px-4 py-2 text-xs font-medium text-[#F4EFE6]/64 transition-colors hover:border-[#F4EFE6]/24 hover:text-[#F4EFE6] sm:mb-1"
          >
            {showEvidence ? '收起评分依据' : '查看评分依据'}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${showEvidence ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </div>

      {showEvidence && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-[#F4EFE6]/10 bg-[#11100E]/45">
          {evidence}
        </div>
      )}
    </motion.div>
  )
}
