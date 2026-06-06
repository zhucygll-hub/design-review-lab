'use client'

import { motion } from 'framer-motion'
import { getScoreColor } from '@/lib/utils'

interface ScoreBadgeProps {
  score: string
  scoreLabel: string
  scoreNumeric: number
}

export default function ScoreBadge({ score, scoreLabel, scoreNumeric }: ScoreBadgeProps) {
  const color = getScoreColor(score)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="report-panel overflow-hidden"
    >
      <div className="grid gap-0 md:grid-cols-[1fr_220px]">
        <div className="p-6 md:p-8">
          <p className="report-kicker">综合评分</p>
          <div className="mt-5 flex items-end gap-4">
            <span className="text-7xl font-semibold tracking-[-0.04em]" style={{ color }}>
              {score}
            </span>
            <div className="pb-2">
              <p className="text-2xl font-semibold text-[#F4EFE6]">{scoreNumeric}/100</p>
              <p className="mt-1 text-sm text-[#F4EFE6]/48">{scoreLabel}</p>
            </div>
          </div>
          <p className="mt-6 max-w-xl text-sm leading-6 text-[#F4EFE6]/56">
            总评不是七个数字的简单平均。系统会先按权重计算，再根据红牌问题和高分门槛做校准。
          </p>
        </div>

        <div className="border-t border-[#F4EFE6]/8 bg-[#11100E]/58 p-6 md:border-l md:border-t-0">
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
              低分会优先解释短板和封顶原因，方便判断下一版应该先改哪里。
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
