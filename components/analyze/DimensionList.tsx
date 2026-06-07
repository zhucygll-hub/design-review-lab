'use client'

import { motion } from 'framer-motion'

interface DimensionListProps {
  completedDimensions: string[]
  currentDimension: string
}

export default function DimensionList({ completedDimensions, currentDimension }: DimensionListProps) {
  const visibleSteps = [...completedDimensions]
  if (currentDimension && !visibleSteps.includes(currentDimension)) {
    visibleSteps.push(currentDimension)
  }

  return (
    <div className="report-panel p-6">
      <h3 className="text-sm font-semibold text-[#F4EFE6]/64 mb-4">正在检查的内容</h3>
      <div className="space-y-3">
        {visibleSteps.map((step) => {
          const isCompleted = completedDimensions.includes(step)
          const isActive = step === currentDimension

          return (
            <motion.div
              key={step}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors duration-300 ${
                isCompleted
                  ? 'bg-[#7EB98E]/8 text-[#F4EFE6]/78'
                  : isActive
                    ? 'bg-[#D6A85A]/9 text-[#F4EFE6]'
                    : 'bg-transparent text-[#F4EFE6]/32'
              }`}
              animate={isActive ? { scale: [1, 1.01, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="shrink-0">
                {isCompleted ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7EB98E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <motion.div
                    className="h-2 w-2 rounded-full bg-[#D6A85A]"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
              <span>{step}</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
