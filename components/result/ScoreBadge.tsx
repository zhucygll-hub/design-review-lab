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
      className="report-panel overflow-hidden"
    >
      <div className={`grid gap-0 ${compact ? '' : 'md:grid-cols-[1fr_240px]'}`}>
        <div className={compact ? 'p-5 md:p-6' : 'p-6 md:p-8'}>
          <p className="report-kicker">综合评分</p>
          <div className={`${compact ? 'mt-4' : 'mt-5'} flex flex-wrap items-end gap-4`}>
            <span className={`${compact ? 'text-6xl' : 'text-7xl'} font-semibold tracking-[-0.04em]`} style={{ color }}>
              {score}
            </span>
            <div className="pb-2">
              <p className={`${compact ? 'text-xl' : 'text-2xl'} font-semibold text-[#F4EFE6]`}>{scoreNumeric}/100</p>
              <p className="mt-1 text-sm text-[#F4EFE6]/48">{scoreLabel}</p>
            </div>
          </div>
          <p className={`${compact ? 'mt-4' : 'mt-6'} max-w-xl text-sm leading-6 text-[#F4EFE6]/56`}>
            总评不是七个数字的简单平均。系统会先计算基础分，再检查是否存在硬伤，以及是否达到高等级作品应有的稳定性。
          </p>

          {evidence && (
            <button
              type="button"
              onClick={() => setShowEvidence((value) => !value)}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#F4EFE6]/12 px-3 py-1.5 text-xs font-medium text-[#F4EFE6]/64 transition-colors hover:border-[#F4EFE6]/24 hover:text-[#F4EFE6]"
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

        <div className={`border-t border-[#F4EFE6]/8 bg-[#11100E]/58 ${compact ? 'p-5' : 'p-6 md:border-l md:border-t-0'}`}>
          <p className="text-xs font-medium text-[#F4EFE6]/36">等级说明</p>
          <div className="mt-4 space-y-3 text-sm text-[#F4EFE6]/58">
            <div className="flex items-center justify-between">
              <span>当前档位</span>
              <span className="font-medium text-[#F4EFE6]">{score}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>最终得分</span>
              <span className="font-mono text-[#F4EFE6]">{scoreNumeric}</span>
            </div>
            <div className="h-px bg-[#F4EFE6]/8" />
            <p className="text-xs leading-5 text-[#F4EFE6]/42">
              先看最大问题和优先修改项，再看完整维度。分数只是入口，具体问题才决定下一版怎么改。
            </p>
          </div>
        </div>
      </div>

      {showEvidence && evidence}
    </motion.div>
  )
}
