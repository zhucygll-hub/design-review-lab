'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  progress: number
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[#F4EFE6]/42">评审报告生成进度</span>
        <span className="text-sm font-semibold text-[#D6A85A]">{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#F4EFE6]/8 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-[#D6A85A]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
