'use client'

import { motion } from 'framer-motion'
import { getScoreColor, getScoreLabel } from '@/lib/utils'

interface ScoreBadgeProps {
  score: string
  scoreLabel: string
  scoreNumeric: number
}

export default function ScoreBadge({ score, scoreLabel, scoreNumeric }: ScoreBadgeProps) {
  const color = getScoreColor(score)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
      className="flex flex-col items-center gap-6 py-8"
    >
      <p className="text-sm text-white/40 uppercase tracking-widest">综合评分</p>

      {/* Score circle */}
      <motion.div
        className="relative flex h-40 w-40 items-center justify-center"
        initial={{ rotate: -10 }}
        animate={{ rotate: 0 }}
        transition={{ duration: 0.8, type: 'spring' }}
      >
        {/* Glow rings */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: `2px solid ${color}30`,
          }}
        />

        {/* Score text */}
        <div className="relative flex flex-col items-center">
          <motion.span
            className="text-6xl font-extrabold tracking-tighter"
            style={{ color }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {score}
          </motion.span>
          <motion.span
            className="text-xs text-white/30 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            {scoreNumeric}/100
          </motion.span>
        </div>
      </motion.div>

      <motion.p
        className="text-base text-white/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {scoreLabel}
      </motion.p>
    </motion.div>
  )
}
