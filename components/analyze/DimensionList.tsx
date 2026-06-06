'use client'

import { motion } from 'framer-motion'

interface DimensionListProps {
  completedDimensions: string[]
  currentDimension: string
}

const ALL_DIMENSIONS = [
  '创意与概念',
  '逻辑与叙事',
  '视觉表达',
  '用户体验',
  '专业完成度',
  '创新价值',
  '商业与现实价值',
]

export default function DimensionList({ completedDimensions, currentDimension }: DimensionListProps) {
  return (
    <div className="report-panel p-6">
      <h3 className="text-sm font-semibold text-[#F4EFE6]/64 mb-4">评审维度</h3>
      <div className="grid grid-cols-2 gap-3">
        {ALL_DIMENSIONS.map((dim) => {
          const isCompleted = completedDimensions.includes(dim)
          const isActive = dim === currentDimension

          return (
            <motion.div
              key={dim}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors duration-300 ${
                isCompleted
                  ? 'bg-[#7EB98E]/8 text-[#F4EFE6]/78'
                  : isActive
                  ? 'bg-[#D6A85A]/9 text-[#F4EFE6]'
                  : 'bg-transparent text-[#F4EFE6]/32'
              }`}
              animate={isActive ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {/* Status icon */}
              <div className="shrink-0">
                {isCompleted ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7EB98E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : isActive ? (
                  <motion.div
                    className="h-2 w-2 rounded-full bg-[#D6A85A]"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-[#F4EFE6]/12" />
                )}
              </div>
              <span>{dim}</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
